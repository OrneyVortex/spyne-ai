"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import Cookie from "js-cookie";

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
  const [initialValues, setInitialValues] = useState({
    title: "",
    description: "",
    images: [],
    tags: [],
  });
  const router = useRouter();

  useEffect(() => {
    if (params?.id) {
      const fetchCarDetails = async () => {
        try {
          const response = await fetch(`https://spyne-ai-backend-production.up.railway.app/api/cars/${params.id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${Cookie.get("accessToken")}`,
              "Content-Type": "application/json",
            },
          });
          if (!response.ok) throw new Error("Car not found");

          const data = await response.json();
          setInitialValues({
            title: data.title || "",
            description: data.description || "",
            images: data.images || [],
            tags: data.tags || [],
            owner: {
              name: data.owner.name || "",
              email: data.owner.email || "",
            },
          });
        } catch (error) {
          console.error("Error fetching car details:", error);
          router.push("/"); // Redirect to dashboard if car is not found
        }
      };
      fetchCarDetails();
    }
  }, [params?.id, router]);

  const handleSubmit = async (values: any, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      const response = await fetch(`https://spyne-ai-backend-production.up.railway.app/api/cars/${params?.id || ""}`, {
        method: params?.id ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${Cookie.get("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Failed to submit car data");

      router.push("/"); // Redirect to dashboard
    } catch (error) {
      console.error("Error submitting car:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
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
                <label htmlFor="title" className="block mb-1">Title</label>
                <Field
                  type="text"
                  id="title"
                  name="title"
                  className="w-full px-3 py-2 border text-black rounded-md"
                  placeholder={initialValues.title} // Use backend data for placeholder
                />
                <ErrorMessage name="title" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block mb-1">Description</label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full text-black px-3 py-2 border rounded-md"
                  placeholder={initialValues.description} // Use backend data for placeholder
                />
                <ErrorMessage name="description" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div className="mb-4">
                <label htmlFor="tags" className="block mb-1">Tags</label>
                <FieldArray name="tags">
                  {({ remove, push }) => (
                    <div>
                      {values.tags && values.tags.length > 0 && values.tags.map((tag, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <Field
                            name={`tags.${index}`}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder={tag} // Use backend data for placeholder
                          />
                          <button type="button" onClick={() => remove(index)} className="ml-2 bg-red-500 text-white px-2 py-2 rounded-md">Remove</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => push("")} className="px-4 py-2 bg-black text-white rounded-md">Add Tag</button>
                    </div>
                  )}
                </FieldArray>
                <ErrorMessage name="tags" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div className="mb-4">
                <label htmlFor="images" className="block mb-1">Images</label>
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={(event) => handleImageUpload(event, setFieldValue)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                {values.images.map((image, index) => (
                  <img key={index} src={image} alt={`Car image ${index + 1}`} className="w-24 h-24 object-cover rounded mr-2 mb-2 inline-block" />
                ))}
              </div>

              <button type="submit" disabled={isSubmitting} className="px-4 py-2 w-full bg-blue-500 text-white rounded-md">
                {isSubmitting ? "Submitting..." : params?.id ? "Update Car" : "Add Car"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
