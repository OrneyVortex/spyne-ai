"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage, FieldArray, FormikHelpers } from "formik";
import * as Yup from "yup";
import Cookie from "js-cookie";
import {jwtDecode} from "jwt-decode"; // Import jwt-decode
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs

interface CarValues {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: File[];
}

const CarSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, "Title must be at least 2 characters")
    .required("Required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .required("Required"),
  tags: Yup.array().of(Yup.string()).min(1, "At least one tag is required"),
});

interface CarFormProps {
  params?: { id: string };
}

export default function CarForm({ params }: CarFormProps) {
  const [initialValues, setInitialValues] = useState<CarValues>({
    id: "",
    title: "",
    description: "",
    tags: [],
    images: [],
  });
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookie.get("accessToken");
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        setUsername(decodedToken.username || "anonymous");
      } catch (error) {
        console.error("Failed to decode token", error);
      }
    }

    if (params?.id) {
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

          const carData: CarValues = await response.json();
          setInitialValues({
            ...carData,
            id: carData.id || uuidv4(),
          });
        } catch (error) {
          console.error("Error fetching car data:", error);
        }
      };

      fetchCarData();
    } else {
      setInitialValues((prevValues) => ({
        ...prevValues,
        id: uuidv4(),
      }));
    }
  }, [params?.id]);

  const handleSubmit = async (
    values: CarValues,
    { setSubmitting }: FormikHelpers<CarValues>
  ) => {
    try {
      const formData = new FormData();

      formData.append("id", values.id);
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("username", username || "anonymous");
      formData.append("tags", JSON.stringify(values.tags));

      // Check if images are selected and append each file to FormData
      if (values.images && values.images.length > 0) {
        values.images.forEach((image: File) => {
          formData.append("images", image);
        });
      } else {
        console.log("No images selected!");
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
      // Append each image to the Formik value
      const fileArray = Array.from(files);
      setFieldValue("images", [...initialValues.images, ...fileArray]);
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
              <Field type="hidden" name="id" value={values.id} />

              {/* Title and Description Fields */}
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

                {/* Display uploaded images */}
                <div className="mt-4">
                  <h3 className="text-lg">Selected Images:</h3>
                  <ul>
                    {values.images && values.images.length > 0 ? (
                      values.images.map((image, index) => (
                        <li key={index}>
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`image-${index}`}
                            className="w-32 h-32 object-cover mt-2"
                          />
                        </li>
                      ))
                    ) : (
                      <p>No images selected</p>
                    )}
                  </ul>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
