/** @format */
import Media from '../models/Media.js';
import { v2 as cloudinary } from 'cloudinary';

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