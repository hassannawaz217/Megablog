import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import appwriteService from "../appwrite/config";

function PostCard({ $id, title, featuredimage }) {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    async function fetchPreview() {
      if (!featuredimage) {
        setPreviewUrl(null);
        return;
      }
      try {
        const url = await appwriteService.getFileView(featuredimage);
        console.log("Image URL:", url);
        setPreviewUrl(url);   // ✅ url is a plain string
      } catch (err) {
        console.error("Error fetching file:", err);
        setPreviewUrl(null);
      }
    }
    fetchPreview();
  }, [featuredimage]);

  return (
    <Link to={`/post/${$id}`}>
      <div className="w-full bg-gray-100 rounded-xl p-4">
        <div className="w-full justify-center mb-4">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={title}
              className="rounded-xl w-96 h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-xl">
              No Image
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
    </Link>
  );
}

export default PostCard;
