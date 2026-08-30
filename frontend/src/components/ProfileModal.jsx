import { useState, useRef } from "react";
import { Camera, X, Upload } from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import UserAvatar from "./UserAvatar";

export default function ProfileModal({ onClose }) {
  const { user, updateUser } = useAuth();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;

    // Validate type
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(selected.type)) {
      setError("Only JPEG, PNG and WEBP images are allowed");
      return;
    }

    // Validate size (5MB max, matching backend)
    if (selected.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setError("");
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const res = await API.patch("/auth/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      updateUser(res.data.user);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to upload profile picture"
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Profile Picture</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="profile-preview">
            {preview ? (
              <img src={preview} alt="Preview" className="preview-image" />
            ) : (
              <UserAvatar
                src={user?.profilePicture}
                name={user?.name}
                size={120}
              />
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <button
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={18} />
            Choose Photo
          </button>

          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            <Upload size={16} />
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
