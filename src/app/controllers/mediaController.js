/** @format */
import Media from '../models/Media.js';
import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
    secure: true
});

/**
 * Uploads a file to Cloudinary
 * 
 * @param {String} fileData - Base64 encoded file data or file URL
 * @param {String} fileName - Original file name
 * @returns {Object} - Upload result with URL
 */
const uploadToCloudinary = async (fileData, fileName) => {
    try {
        // Generate a folder structure and filename based on date to help with organization
        const date = new Date();
        const folder = `storygrid/${date.getFullYear()}/${date.getMonth() + 1}`;
        
        const uploadOptions = {
            public_id: `${folder}/${Date.now()}_${fileName.split('.')[0]}`,
            resource_type: 'auto', // Automatically detect if it's an image, video, etc.
            overwrite: true,
            invalidate: true
        };
        
        // Check if fileData is a URL (starts with http:// or https://)
        const isUrl = fileData.startsWith('http://') || fileData.startsWith('https://');
        
        // Upload the file to Cloudinary - either from URL or base64 data
        const result = await cloudinary.uploader.upload(fileData, uploadOptions);
        
        // Determine the media type
        let type = 'unknown';
        if (result.resource_type === 'image') type = 'image';
        else if (result.resource_type === 'video') type = 'video';
        else if (result.resource_type === 'raw' && result.format === 'mp3') type = 'audio';
        
        // Return URL and type
        return {
            url: result.secure_url,
            type: type,
            publicId: result.public_id,
            metadata: {
                width: result.width,
                height: result.height,
                format: result.format,
                resourceType: result.resource_type,
                bytes: result.bytes
            }
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

/**
 * API Documentation:
 * @route POST /api/media/upload
 * @description Upload media file to Cloudinary
 * @access Private - Requires authentication
 * 
 * @bodyParam {String} file - Base64 encoded file data or URL
 * @bodyParam {String} fileName - Name of the file
 * @bodyParam {String} [storyId] - Optional ID of story to associate with (for later attachment)
 * 
 * @response {Object} data - Contains URL and metadata of uploaded file
 * 
 * Controller for uploading media
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const uploadMedia = async (req) => {
    try {
        const { file, fileName, storyId } = req.body.data || req.body;
        const userId = req.user.id;
        let fileNameFromUrl;

        // Validate required fields
        if (!file) {
            return {
                status: 400,
                msg: "File data is required (URL or base64)",
                data: null
            };
        }

        if (!fileName) {
            // If file is a URL and no fileName is provided, extract it from the URL
            if (file.startsWith('http://') || file.startsWith('https://')) {
                const urlParts = file.split('/');
                fileNameFromUrl = urlParts[urlParts.length - 1].split('?')[0];
                if (fileNameFromUrl) {
                    console.log('Extracted filename from URL:', fileNameFromUrl);
                } else {
                    return {
                        status: 400,
                        msg: "File name is required",
                        data: null
                    };
                }
            } else {
                return {
                    status: 400,
                    msg: "File name is required",
                    data: null
                };
            }
        }

        // Use provided fileName or the one extracted from URL
        const finalFileName = fileName || fileNameFromUrl;
        
        console.log('Uploading file:', finalFileName);
        
        // Upload file to Cloudinary
        const uploadResult = await uploadToCloudinary(file, finalFileName);
        
        console.log('Upload successful:', uploadResult.url);
        
        // Create Media record if storyId is provided
        let mediaRecord = null;
        if (storyId) {
            mediaRecord = await Media.create({
                storyId,
                type: uploadResult.type,
                url: uploadResult.url,
                order: 0,  // Default order
                metadata: {
                    originalName: finalFileName,
                    uploadedBy: userId,
                    uploadedAt: new Date(),
                    cloudinary: {
                        publicId: uploadResult.publicId,
                        ...uploadResult.metadata
                    }
                }
            });
        }

        return {
            status: 201,
            msg: "Media uploaded successfully",
            data: {
                url: uploadResult.url,
                type: uploadResult.type,
                mediaId: mediaRecord ? mediaRecord.id : null,
                metadata: uploadResult.metadata
            }
        };
    } catch (error) {
        console.error("Media upload error:", error);
        return {
            status: 500,
            msg: "Internal Server Error: " + error.message,
            data: null,
            error: {
                code: error.code || 'UPLOAD_ERROR',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        };
    }
};

/**
 * API Documentation:
 * @route POST /api/media/getUploadParams
 * @description Get Cloudinary direct upload parameters for frontend direct uploads
 * @access Private - Requires authentication
 * 
 * @bodyParam {String} fileName - Name of the file to be uploaded (optional)
 * @bodyParam {String} fileType - MIME type of the file (optional)
 * 
 * @response {Object} data - Contains parameters for direct Cloudinary upload
 * 
 * Controller for getting upload parameters
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and upload parameters
 */
export const getUploadParams = async (req) => {
    try {
        const userId = req.user.id;
        const { fileName, fileType } = req.body.data || req.body || {};
        
        // Generate a timestamp for the signature
        const timestamp = Math.round(new Date().getTime() / 1000);
        
        // Create a folder structure based on date
        const date = new Date();
        const folder = `storygrid/${date.getFullYear()}/${date.getMonth() + 1}`;
        
        // Create the public_id for the upload (optional)
        const publicId = fileName 
            ? `${folder}/${Date.now()}_${fileName.split('.')[0]}`
            : `${folder}/${Date.now()}_${userId.substring(0, 8)}`;
            
        // Create the upload parameters
        const uploadParams = {
            timestamp: timestamp,
            folder: folder,
            public_id: publicId,
            api_key: process.env.CLOUDINARY_API_KEY
        };
        
        // For signed uploads, create a signature
        if (process.env.CLOUDINARY_API_SECRET) {
            const stringToSign = Object.keys(uploadParams)
                .filter(key => key !== 'api_key' && uploadParams[key])
                .sort()
                .map(key => `${key}=${uploadParams[key]}`)
                .join('&') + process.env.CLOUDINARY_API_SECRET;
                
            uploadParams.signature = crypto
                .createHash('sha1')
                .update(stringToSign)
                .digest('hex');
        }
        
        // Return the parameters needed for the frontend to upload directly
        return {
            status: 200,
            msg: "Upload parameters generated successfully",
            data: {
                cloudName: process.env.CLOUDINARY_CLOUD_NAME,
                apiKey: process.env.CLOUDINARY_API_KEY,
                uploadParams,
                // For unsigned uploads:
                uploadPreset: 'my_unsigned_preset', // Replace with your actual preset name
                folder: folder,
                // Include upload URL for convenience
                uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`
            }
        };
    } catch (error) {
        console.error("Error generating upload parameters:", error);
        return {
            status: 500,
            msg: "Failed to generate upload parameters",
            data: null,
            error: {
                code: error.code || 'PARAMS_ERROR',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        };
    }
};

/**
 * API Documentation:
 * @route POST /api/media/saveUploadedMedia
 * @description Save information about media directly uploaded to Cloudinary
 * @access Private - Requires authentication
 * 
 * @bodyParam {String} url - Cloudinary URL of the uploaded media
 * @bodyParam {String} type - Type of media (image, video, audio)
 * @bodyParam {String} [storyId] - Optional ID of story to associate with
 * @bodyParam {Object} [metadata] - Optional metadata from Cloudinary
 * 
 * @response {Object} data - Contains saved media record information
 * 
 * Controller for saving uploaded media information
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const saveUploadedMedia = async (req) => {
    try {
        const { url, type, storyId, metadata } = req.body.data || req.body;
        const userId = req.user.id;
        
        // Validate required fields
        if (!url) {
            return {
                status: 400,
                msg: "Media URL is required",
                data: null
            };
        }
        
        if (!type) {
            return {
                status: 400,
                msg: "Media type is required",
                data: null
            };
        }
        
        // Extract filename from URL for metadata
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1].split('?')[0];
        
        // Create the media record
        const mediaRecord = await Media.create({
            storyId: storyId || null,
            type,
            url,
            order: 0,
            metadata: {
                originalName: fileName,
                uploadedBy: userId,
                uploadedAt: new Date(),
                cloudinary: metadata || {}
            }
        });
        
        return {
            status: 201,
            msg: "Media record saved successfully",
            data: {
                mediaId: mediaRecord.id,
                url: mediaRecord.url,
                type: mediaRecord.type
            }
        };
    } catch (error) {
        console.error("Error saving media record:", error);
        return {
            status: 500,
            msg: "Failed to save media record",
            data: null,
            error: {
                code: error.code || 'SAVE_ERROR',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        };
    }
};

/**
 * API Documentation:
 * @route DELETE /api/media/delete
 * @description Delete media from Cloudinary and database
 * @access Private - Requires authentication
 * 
 * @bodyParam {String} mediaId - ID of the media to delete
 * 
 * @response {Object} data - Success message
 * 
 * Controller for deleting media
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const deleteMedia = async (req) => {
    try {
        const { mediaId } = req.body.data || req.body;
        const userId = req.user.id;

        if (!mediaId) {
            return {
                status: 400,
                msg: "Media ID is required",
                data: null
            };
        }

        // Find the media
        const media = await Media.findByPk(mediaId);
        if (!media) {
            return {
                status: 404,
                msg: "Media not found",
                data: null
            };
        }

        // Delete the file from Cloudinary if publicId is available
        try {
            if (media.metadata && media.metadata.cloudinary && media.metadata.cloudinary.publicId) {
                const publicId = media.metadata.cloudinary.publicId;
                const resourceType = media.metadata.cloudinary.resourceType || 'image';
                
                await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
            }
        } catch (deleteError) {
            console.error('Cloudinary delete error:', deleteError);
            // Continue even if Cloudinary deletion fails
        }

        // Delete the media record
        await media.destroy();

        return {
            status: 200,
            msg: "Media deleted successfully",
            data: null
        };
    } catch (error) {
        console.error("Media delete error:", error);
        return {
            status: 500,
            msg: "Internal Server Error: " + error.message,
            data: null,
            error: {
                code: error.code || 'DELETE_ERROR',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        };
    }
}; 