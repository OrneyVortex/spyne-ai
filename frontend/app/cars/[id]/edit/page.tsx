"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import { mockCars, Car } from "../../../../lib/mock-data";

const CarSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, "Title must be at least 2 characters")
    .required("Required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .required("Required"),
  tags: Yup.array().of(Yup.string()).min(1, "At least one tag is required"),
  owner: Yup.object().shape({
    name: Yup.string().required("Owner name is required"),
    email: Yup.string()
      .email("Invalid email")
      .required("Owner email is required"),
  }),
});

export default function CarForm({ params }: { params?: { id: string } }) {
  const [initialValues, setInitialValues] = useState<any>({
    id: "",
    title: "",
    description: "",
    images: [],
    tags: [],
  });
  const router = useRouter();

  useEffect(() => {
    if (params?.id) {
      const foundCar = mockCars.find((c) => c.id === params.id);
      if (foundCar) {
        setInitialValues(foundCar);
      }
    }
  }, [params?.id]);

  const handleSubmit = (
    values: Car,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    // In a real application, you would make an API call here
    setTimeout(() => {
      console.log(values);
      setSubmitting(false);
      router.push("/");
    }, 1000);
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
                    className="w-24 h-24 object-cover rounded mr-2 mb-2 inline-block"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 w-full bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isSubmitting
                  ? "Submitting..."
                  : params?.id
                  ? "Update Car"
                  : "Add Car"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
