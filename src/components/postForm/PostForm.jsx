import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import authService from "../../appwrite/auth";
import { useNavigate } from "react-router-dom";

export default function PostForm({ post }) {
  const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
    defaultValues: {
      title: post?.title || "",
      slug: post?.$id || "",
      content: post?.content || "",
      status: post?.status || "active",
    },
  });

  const navigate = useNavigate();
  const [fileId, setFileId] = useState(post?.featuredimage || null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    async function fetchPreview() {
      if (fileId) {
        const url = await appwriteService.getFilePreview(fileId);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
    fetchPreview();
  }, [fileId]);

  const submit = async (data) => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return alert("Please login first");

      let updatedFileId = fileId;

      if (data.image?.[0]) {
        const uploadedFile = await appwriteService.uploadFile(data.image[0]);
        if (!uploadedFile.$id) return alert("File upload failed!");
        updatedFileId = uploadedFile.$id;
        setFileId(updatedFileId);

        if (post?.featuredimage) {
          await appwriteService.deleteFile(post.featuredimage);
        }
      }

      const postData = {
        title: data.title,
        slug: data.slug,
        content: data.content,
        status: data.status,
        featuredimage: updatedFileId || null, 
        userid: user.$id,
      };

      let dbPost = null;
      if (post) {
        dbPost = await appwriteService.updatePost(post.$id, postData);
      } else {
        dbPost = await appwriteService.createPost(postData);
      }

      if (dbPost) navigate(`/post/${dbPost.$id}`);
    } catch (error) {
      console.error("Error creating/updating post:", error);
      alert("Error creating/updating post");
    }
  };

  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string")
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, "-")
        .replace(/\s/g, "-");
    return "";
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
      <div className="w-2/3 px-2">
        <Input
          label="Title :"
          placeholder="Title"
          className="mb-4"
          {...register("title", { required: true })}
        />
        <Input
          label="Slug :"
          placeholder="Slug"
          className="mb-4"
          {...register("slug", { required: true })}
          onInput={(e) =>
            setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true })
          }
        />
        <RTE
          label="Content :"
          name="content"
          control={control}
          defaultValue={getValues("content")}
        />
      </div>
      <div className="w-1/3 px-2">
        <Input
          label="Featured Image :"
          type="file"
          className="mb-4"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("image", { required: !post })}
        />

        {/* ✅ Async image preview */}
        {previewUrl ? (
          <div className="w-full mb-4">
            <img
              src={previewUrl}
              alt={getValues("title") || "Post Image"}
              className="rounded-lg w-full h-48 object-cover"
            />
          </div>
        ) : (
          <div className="w-full mb-4 rounded-lg bg-gray-200 h-48 flex items-center justify-center">
            No Image
          </div>
        )}

        <Select
          options={["active", "inactive"]}
          label="Status"
          className="mb-4"
          {...register("status", { required: true })}
        />
        <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full">
          {post ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}
