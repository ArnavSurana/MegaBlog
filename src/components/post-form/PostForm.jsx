import React, { useCallback } from "react";
import { useForm,Controller } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import './PostForm.css'
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
    const userData = useSelector((state) => state.auth.userData);

    const submit = async (data) => {
        if (post) {
            const file = data.image[0] ? await appwriteService.uploadFile(data.image[0]) : null;

            if (file && post.featuredImage) {
                appwriteService.deleteFile(post.featuredImage);
            }   

            const updateData = {
                title: data.title,
                content: data.content,
                status: data.status,
                featuredImage: file ? file.$id : post.featuredImage
            };
            
            const dbPost = await appwriteService.updatePost(post.$id, updateData);

            if (dbPost) {
                navigate(`/post/${dbPost.$id}`);
            }
        } else {
            const file = await appwriteService.uploadFile(data.image[0]);

            if (file) {
                const dbPost = await appwriteService.createPost({ ...data, userId: userData?.$id ,featuredImage : file.$id});

                if (dbPost) {
                    navigate(`/post/${dbPost.$id}`);
                }
            }
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

    React.useEffect(() => {
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
                    onInput={(e) => {
                        setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                    }}
                />
                <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />
            </div>
            <div className="w-1/3 px-2">
                <Input
                    label="Featured Image :"
                    type="file"
                    className="mb-4"
                    accept="image/png, image/jpg, image/jpeg, image/gif"
                    {...register("image", { required: !post })}
                />
                {post && (
                    <div className="w-full mb-4">
                        {post.featuredImage ? (
                                <img
                                    src={appwriteService.getFilePreview(post.featuredImage) || "/placeholder-image.jpg"}
                                    alt={post.title}
                                    className="rounded-lg"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/placeholder-image.jpg";
                                    }}
                                />
                        ) : (
                            <div className="bg-gray-200 rounded-lg flex items-center justify-center h-48">
                                <span className="text-gray-500">No featured image</span>
                            </div>
                        )}
                    </div>
                )}
                <Controller
                    control={control}
                    name="status"
                    rules={{ required: true }}
                    render={({ field }) => (
                        <Select
                            options={["active", "inactive"]}
                            label="Status"
                            className="mb-4"
                            {...field}
                        />
                    )}
                />
                <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full">
                    {post ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );
}