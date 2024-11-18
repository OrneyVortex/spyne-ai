"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import Cookie from "js-cookie";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs

const CarSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, "Title must be at least 2 characters")
    .required("Required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .required("Required"),
  tags: Yup.array().of(Yup.string()).min(1, "At least one tag is required"),
});

export default function CarForm({ params }: { params?: { id: string } }) {
  const [initialValues, setInitialValues] = useState<any>({
    id: "",
    title: "",
    description: "",
    tags: [],
    images: [],
    username: "", // Initially empty, to be set automatically
  });
  const router = useRouter();

  // Function to fetch the username from the backend using the token
  const fetchUsername = async () => {
    try {
      const token = Cookie.get("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch("https://spyne-ai-backend-production.up.railway.app/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch username");
      }

      const data = await response.json();
      return data.username; // Assuming the response has a 'username' field
    } catch (error) {
      console.error("Error fetching username:", error);
      return null; // Return null if the username cannot be fetched
    }
  };

  // Handle setting initial values, including fetching username
  useEffect(() => {
    const initializeForm = async () => {
      let username = "default_username"; // Fallback username
      if (!params?.id) {
        // For new car entries, generate a unique ID
        setInitialValues((prevValues) => ({
          ...prevValues,
          id: uuidv4(),
        }));
      } else {
        // If editing an existing car, fetch the username
        username = await fetchUsername();
      }

      setInitialValues((prevValues) => ({
        ...prevValues,
        username, // Automatically set username from the token
      }));
    };

    initializeForm();
  }, [params?.id]);

  const handleSubmit = async (
    values: any,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const formData = new FormData();

      formData.append("id", values.id);
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("username", values.username);

      // Append tags as a JSON string
      formData.append("tags", JSON.stringify(values.tags));

      // Append images (files)
      if (values.images) {
        values.images.forEach((image: any) => {
          formData.append("images", image);
        });
      }

      const token = Cookie.get("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        "https://spyne-ai-backend-production.up.railway.app/api/cars",
        {
          method: params?.id ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit car data");
      }

      setSubmitting(false);
      router.push("/");
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitting(false);
    }
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setFieldValue("images", [...initialValues.images, ...newImages]);
    }
  };

  return (
    <div className="min-h-screen flex justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-3xl text-center font-bold mb-8">
          {params?.id ? "Edit Car" : "Add New Car"}
        </h1>
        <Formik
          initialValues={initialValues}
          validationSchema={CarSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className="max-w-lg">
              {/* Car ID Field - Hidden */}
              <Field type="hidden" name="id" value={values.id} />

              {/* Username Field - Hidden (set automatically) */}
              <Field type="hidden" name="username" value={values.username} />

              {/* Other Fields (Title, Description, Tags, etc.) */}
              <div className="mb-4">
                <label htmlFor="title" className="block mb-1">
                  Title
                </label>
                <Field
                  type="text"
                  id="title"
                  name="title"
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                <ErrorMessage
                  name="title"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block mb-1">
                  Description
                </label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full resize-none no-scrollbar px-3 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="tags" className="block mb-1">
                  Tags
                </label>
                <FieldArray
                  name="tags"
                  render={(arrayHelpers) => (
                    <div>
                      {values.tags && values.tags.length > 0
                        ? values.tags.map((tag, index) => (
                            <div key={index} className="flex items-center mb-2">
                              <Field
                                name={`tags.${index}`}
                                className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                              />
                              <button
                                type="button"
                                onClick={() => arrayHelpers.remove(index)}
                                className="ml-2 px-2 py-2 bg-red-500 text-white rounded-md"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        : null}
                      <button
                        type="button"
                        onClick={() => arrayHelpers.push("")}
                        className="px-4 py-2 bg-black dark:bg-white dark:text-black text-white rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Add Tag
                      </button>
                    </div>
                  )}
                />
                <ErrorMessage
                  name="tags"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="images" className="block mb-1">
                  Images
                </label>
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={(event) => handleImageUpload(event, setFieldValue)}
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-gray-800 dark:border-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                {values.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Car image ${index + 1}`}
                    className="w-32 h-32 object-cover mb-2"
                  />
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-black dark:bg-white dark:text-black text-white rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
