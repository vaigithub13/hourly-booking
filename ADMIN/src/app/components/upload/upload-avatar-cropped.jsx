import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { CameraEnhance, Close, CloudUpload } from "@mui/icons-material";

import getCroppedImg, { getFileFromBlobUrl } from "app/utils/utils";
import RejectionFiles from "./errors-rejection-files";
import Image from "../image";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { LoadingButton } from "@mui/lab";

export default function UploadAvatarCropped({
  error,
  file,
  disabled,
  helperText,
  sx,
  onFileUpload
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(typeof file === "string" ? file : file.preview);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple: false,
    disabled,
    accept: {
      ".jpg": [],
      ".jpeg": [],
      ".png": []
    },
    onDrop: (acceptedFiles) => {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(acceptedFiles[0]);
    }
  });

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onCrop = useCallback(async () => {
    setIsCropping(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(croppedImage);
      const newFile = await getFileFromBlobUrl(croppedImage);
      onFileUpload(newFile);
    } catch (e) {
      console.error("test", e);
    } finally {
      setImageSrc(null);
      setIsCropping(false);
    }
  }, [croppedAreaPixels, imageSrc, onFileUpload]);

  const hasFile = !!file;

  const renderPreview = croppedImage && (
    <Image
      alt="avatar"
      src={croppedImage}
      sx={{
        width: 1,
        height: 1,
        borderRadius: "50%"
      }}
    />
  );

  const renderPlaceholder = (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1}
      className="upload-placeholder"
      sx={{
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        zIndex: 9,
        borderRadius: "50%",
        position: "absolute",
        color: "text.disabled",
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
        transition: (theme) =>
          theme.transitions.create(["opacity"], {
            duration: theme.transitions.duration.shorter
          }),
        "&:hover": {
          opacity: 0.72
        },

        ...(hasFile && {
          zIndex: 9,
          opacity: 0,
          color: "common.white",
          bgcolor: (theme) => alpha(theme.palette.grey[900], 0.64)
        })
      }}
    >
      <CameraEnhance width={32} />

      <Typography variant="caption">{file ? "Update photo" : "Upload photo"}</Typography>
    </Stack>
  );

  const renderContent = (
    <Box
      sx={{
        width: 1,
        height: 1,
        overflow: "hidden",
        borderRadius: "50%",
        position: "relative"
      }}
    >
      {renderPreview}
      {renderPlaceholder}
    </Box>
  );

  return (
    <>
      <Box
        {...getRootProps()}
        sx={{
          p: 1,
          m: "auto",
          width: 144,
          height: 144,
          cursor: "pointer",
          overflow: "hidden",
          borderRadius: "50%",
          border: (theme) => `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
          ...(isDragActive && { opacity: 0.72 }),
          ...(disabled && { opacity: 0.48, pointerEvents: "none" }),
          ...(error && { borderColor: "error.main" }),
          ...sx
        }}
      >
        <input {...getInputProps()} />
        {renderContent}
      </Box>

      {helperText && helperText}

      <RejectionFiles fileRejections={fileRejections} />

      {/* {imageSrc && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 300, // Increased height for better visibility
            borderRadius: '16px', // Adds rounded corners
            overflow: 'hidden', // Ensures content stays within the box
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Adds subtle shadow for depth
            backgroundColor: '#f9f9f9', // Light background for better contrast
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            style={{
              containerStyle: {
                borderRadius: '16px', // Matches the outer border radius
              },
              mediaStyle: {
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'cover', // Ensures the image covers the area nicely
              },
            }}
          />
          <IconButton
            onClick={onCrop}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <CloudUpload />
          </IconButton>
        </div>
      )} */}

      <Dialog
        open={Boolean(imageSrc)}
        onClose={() => setImageSrc(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)"
          }
        }}
        TransitionProps={{
          appear: true,
          in: Boolean(imageSrc),
          timeout: 300
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "primary.main",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 2
          }}
        >
          Crop Image
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setImageSrc(null)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
              "&:hover": {
                backgroundColor: "transparent"
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          style={{
            position: "relative",
            height: 400,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f9f9f9"
          }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            style={{
              containerStyle: {
                width: "100%",
                height: "100%"
              },
              mediaStyle: {
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "cover"
              }
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: "primary.main",
            color: "white",
            padding: 2
          }}
        >
          <LoadingButton
            onClick={onCrop}
            loading={isCropping}
            variant="text"
            color="info"
            sx={{
              color: "common.white",
              "&:hover": {
                backgroundColor: "primary.dark"
              },
              borderRadius: 2
            }}
          >
            Crop & Upload
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

UploadAvatarCropped.propTypes = {
  error: PropTypes.bool,
  file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  disabled: PropTypes.bool,
  helperText: PropTypes.node,
  sx: PropTypes.object,
  onFileUpload: PropTypes.func.isRequired
};
