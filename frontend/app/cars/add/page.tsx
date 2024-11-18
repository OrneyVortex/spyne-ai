"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import Cookie from "js-cookie";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs

// Update schema to exclude username
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
    id: "", // Initially set to empty, we'll handle it based on the data fetched
    title: "",
    description: "",
    tags: [],
    images: [],
  });
  const [username, setUsername] = useState<string | null>(null); // State to hold the username
  const router = useRouter();

  useEffect(() => {
    // Extract username from the accessToken (JWT)
    const token = Cookie.get("accessToken");
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token); // Decode the JWT
        setUsername(decodedToken.username || "anonymous"); // If no username, set it to "anonymous"
      } catch (error) {
        console.error("Failed to decode token", error);
      }
    }

    if (params?.id) {
      // Fetch data for editing an existing car
      const fetchCarData = async () => {
        try {
          const response = await fetch(
            `https://spyne-ai-backend-production.up.railway.app/api/cars/${params.id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch car data");
          }

          const carData = await response.json();
          setInitialValues({
            ...carData,
            id: carData.id || uuidv4(), // If no ID exists in the response, generate one
          });
        } catch (error) {
          console.error("Error fetching car data:", error);
        }
      };

      fetchCarData();
    } else {
      // For new car entries, generate a unique ID
      setInitialValues((prevValues) => ({
        ...prevValues,
        id: uuidv4(),
      }));
    }
  }, [params?.id]);

  const handleSubmit = async (
    values: any,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const formData = new FormData();

      // Append normal fields
      formData.append("id", values.id); // Include the ID in the form submission
      formData.append("title", values.title);
      formData.append("description", values.description);

      // Include the decoded username or anonymous if not available
      formData.append("username", username || "anonymous");

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
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={(event) => handleImageUpload(event, setFieldValue)}
                  className="block w-full text-sm text-gray-500 dark:text-gray-300"
                />
                <ErrorMessage
                  name="images"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 bg-black dark:bg-white dark:text-black text-white rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
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
