"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const pendingCertifications: any[] = [];

interface CertificationFile {
  name: string;
  file: File;
  certificationName: string;
  issuingAuthority: string;
}

interface SignupFormData {
  // Common fields
  email: string;
  password: string;
  confirmPassword: string;

  // Technician fields
  firstName: string;
  lastName: string;
  phoneNumber: string;

  // Separate address fields
  street: string;
  city: string;
  district: string;

  address: string;

  specialization: string;
  yearsOfExperience: number | "";

  // Company fields
  companyName: string;
  companyid: string;

  // Public User fields
  fullName: string;

  // Certifications (for technician)
  certifications: CertificationFile[];
}

const sriLankanDistricts = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

export default function SignupCard() {
  const [role, setRole] = useState<string>("Public User");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSendingCode, setIsSendingCode] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [codeSent, setCodeSent] = useState<boolean>(false);
  const router = useRouter();
  const [currentCert, setCurrentCert] = useState<{
    certificationName: string;
    issuingAuthority: string;
    file: File | null;
  }>({
    certificationName: "",
    issuingAuthority: "",
    file: null,
  });

  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    street: "",
    city: "",
    district: "",
    address: "",
    specialization: "",
    yearsOfExperience: "",
    companyName: "",
    companyid: "",
    fullName: "",
    certifications: [],
  });

  const roles: string[] = ["Public User", "Technician", "Company"];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCertificationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setCurrentCert((prev) => ({ ...prev, [name]: value }));
  };

  const handleCertificationFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        e.target.value = "";
        return;
      }
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("File type must be PDF, JPG, JPEG, or PNG");
        e.target.value = "";
        return;
      }
      setCurrentCert((prev) => ({ ...prev, file: file }));
    }
  };

  const addCertification = () => {
    if (
      !currentCert.certificationName ||
      !currentCert.issuingAuthority ||
      !currentCert.file
    ) {
      alert("Please fill all certification fields and upload a file");
      return;
    }
    const newCert: CertificationFile = {
      name: currentCert.file.name,
      file: currentCert.file,
      certificationName: currentCert.certificationName,
      issuingAuthority: currentCert.issuingAuthority,
    };
    setFormData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, newCert],
    }));
    setCurrentCert({ certificationName: "", issuingAuthority: "", file: null });
    const fileInput = document.getElementById("cert-file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const removeCertification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#?&])[A-Za-z\d@$!%#?&]{6,}$/;
    return passwordRegex.test(password);
  };

  const combineAddress = (): string => {
    const parts = [];
    if (formData.street) parts.push(formData.street);
    if (formData.city) parts.push(formData.city);
    if (formData.district) parts.push(formData.district);
    return parts.join(", ");
  };

  const handleRequestCode = async () => {
    if (!formData.email) {
      alert("Please enter email first");
      return;
    }
    if (!validateEmail(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }
    try {
      setIsSendingCode(true);
      const response = await fetch(
        `http://localhost:5050/sendMail/${formData.email}`,
        {
          method: "GET",
        },
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to send verification code");
      }
      setCodeSent(true);
      alert("Verification code sent to your email");
    } catch (error) {
      console.error("Failed to send code:", error);
      alert(
        "Failed to send verification code. Please check if the backend is running.",
      );
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // if (formData.password.length < 6) {
    //   alert("Password must be at least 6 characters");
    //   return;
    // }

    // if (!validatePassword(formData.password)) {
    //   alert(
    //     "Password must be at least 6 characters and include at least one lowercase letter, one uppercase letter, one number, and one special character",
    //   );
    //   return;
    // }

    if (role === "Technician") {
      if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
        alert("Please fill in all required fields");
        return;
      }
      if (!validatePhoneNumber(formData.phoneNumber)) {
        alert("Phone number must be 10-15 digits");
        return;
      }
      if (!formData.street || !formData.city || !formData.district) {
        alert("Please fill in street, city, and select a district");
        return;
      }
      if (formData.certifications.length === 0) {
        alert("At least one certification is required");
        return;
      }
      if (formData.firstName.length < 2 || formData.firstName.length > 50) {
        alert("First name must be between 2 and 50 characters");
        return;
      }
      if (formData.lastName.length < 2 || formData.lastName.length > 50) {
        alert("Last name must be between 2 and 50 characters");
        return;
      }
      if (
        formData.yearsOfExperience !== "" &&
        (formData.yearsOfExperience < 0 || formData.yearsOfExperience > 50)
      ) {
        alert("Years of experience must be between 0 and 50");
        return;
      }
    }

    if (role === "Company") {
      if (!formData.companyName || !formData.companyid) {
        alert("Please fill in all company fields");
        return;
      }
      // if (!verificationCode) {
      //     alert("Please request and enter verification code");
      //     return;
      // }
      // if (verificationCode.length !== 6) {
      //     alert("Verification code must be 6 digits");
      //     return;
      // }
    }

    // STEP 2 - Updated Public User validation (no verification code check here)
    if (role === "Public User") {
      if (!formData.firstName || !formData.lastName) {
        alert("Please enter your full name");
        return;
      }
      if (!formData.phoneNumber) {
        alert("Please enter your phone number");
        return;
      }
      if (!validatePhoneNumber(formData.phoneNumber)) {
        alert("Phone number must be 10-15 digits");
        return;
      }
    }

    if (!agreeTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      let endpoint = "";
      let response: Response;

      if (role === "Technician") {
        // endpoint =
        //   "http://localhost:5050/auth/technician/register";
        // const formDataObj = new FormData();
        // formDataObj.append("firstName", formData.firstName);
        // formDataObj.append("lastName", formData.lastName);
        // formDataObj.append("email", formData.email);
        // formDataObj.append("phoneNumber", formData.phoneNumber);
        // formDataObj.append("password", formData.password);
        // const fullAddress = combineAddress();
        // // formDataObj.append("address", fullAddress);
        // formDataObj.append("specialization", formData.specialization || "");
        // // if (formData.yearsOfExperience !== '') {
        // //     formDataObj.append("yearsOfExperience", formData.yearsOfExperience.toString());
        // // }
        // formData.certifications.forEach((cert, index) => {
        //   formDataObj.append(
        //     `certifications[${index}].certificationName`,
        //     cert.certificationName,
        //   );
        //   // formDataObj.append(`certifications[${index}].issuingAuthority`, cert.issuingAuthority);
        //   formDataObj.append(`certifications[${index}].file`, cert.file);
        // });
        // response = await fetch(endpoint, {
        //   method: "POST",
        //   body: formDataObj,
        // });
        // Store form data in sessionStorage
        sessionStorage.setItem(
          "pendingRegistration",
          JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            password: formData.password,
            address: combineAddress(),
            district: formData.district,
            specialization: formData.specialization || "",
            yearsOfExperience:
              formData.yearsOfExperience !== ""
                ? formData.yearsOfExperience.toString()
                : null,
            role: role,
          }),
        );

        // Store certifications separately since they contain File objects
        // which can't be serialized to sessionStorage
        // We'll keep them in a module-level variable temporarily
        // ✅ FIX
        // Store files in module-level variable (survives router.push soft navigation)
        pendingCertifications.length = 0;
        formData.certifications.forEach((cert) => {
          pendingCertifications.push(cert);
        });

        // Send verification email
        await fetch(`http://localhost:5050/sendMail/${formData.email}`, {
          method: "GET",
        });

        //setIsLoading(false);
        // window.location.href = "/verify-email";
        router.push("/verify-email");
        return;
      } else if (role === "Company") {
        // endpoint = `http://localhost:5050/auth/company/register/${verificationCode}`;
        // const companyData = {
        //     name: formData.companyName,
        //     email: formData.email,
        //     companyid: formData.companyid,
        //     password: formData.password
        // };
        // response = await fetch(endpoint, {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify(companyData)
        // });
        sessionStorage.setItem(
          "pendingRegistration",
          JSON.stringify({
            name: formData.companyName,
            email: formData.email,
            companyid: formData.companyid,
            password: formData.password,
            role: role,
          }),
        );
        await fetch(`http://localhost:5050/sendMail/${formData.email}`, {
          method: "GET",
        });
        setIsLoading(false);
        router.push("/verify-email");
        return;
      } else {
        // STEP 1 - Store form data and redirect to verify page
        sessionStorage.setItem(
          "pendingRegistration",
          JSON.stringify({
            fname: formData.firstName,
            lname: formData.lastName,
            email: formData.email,
            password: formData.password,
            phone: formData.phoneNumber,
            role: role,
          }),
        );

        // Send verification email
        await fetch(`http://localhost:5050/sendMail/${formData.email}`, {
          method: "GET",
        });

        setIsLoading(false);
        router.push("/verify-email");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", response.status, errorText);
        let errorMessage = `Registration failed: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Registration successful:", data);

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data));
      }

      const successMessage =
        role === "Technician"
          ? "Registration successful! Your account is pending admin approval."
          : "Registration successful!";

      alert(successMessage);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error("Registration failed:", error);
      let errorMessage = "Registration failed. ";
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please check your input and try again.";
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => {
    switch (role) {
      case "Company":
        return (
          <>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">
              Company Sign Up
            </h2>
            <p className="text-gray-500 mt-2 mb-7 text-sm">
              Create a corporate account to manage your environmental
              compliance.
            </p>
          </>
        );
      case "Technician":
        return (
          <>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">
              Technician Registration
            </h2>
            <p className="text-gray-500 mt-2 mb-7 text-sm">
              Complete the form below to create your professional account.
            </p>
          </>
        );
      default:
        return (
          <>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">
              Create Your Account
            </h2>
            <p className="text-gray-500 mt-2 mb-7 text-sm">
              Join our platform and help protect the environment.
            </p>
          </>
        );
    }
  };

  const renderTechnicianFields = () => {
    return (
      <>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            First Name *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </span>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="John"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
              required
              minLength={2}
              maxLength={50}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Last Name *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </span>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Doe"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
              required
              minLength={2}
              maxLength={50}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john.doe@example.com"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Phone Number *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </span>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="1234567890"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
              required
              pattern="[0-9]{10,15}"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Street Address *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </span>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              placeholder="123 Main Street"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            City *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </span>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Colombo"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            District *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </span>
            <select
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-8 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
              required
            >
              <option value="" disabled>
                Select a district
              </option>
              {sriLankanDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {(formData.street || formData.city || formData.district) && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">
              Address preview (will be stored as):
            </p>
            <p className="text-sm text-gray-700 font-medium">
              {combineAddress()}
            </p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Specialization
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </span>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              placeholder="e.g. HVAC, Electrical, Plumbing"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Years of Experience
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleInputChange}
              placeholder="5"
              min="0"
              max="50"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Certifications *
          </label>
          {formData.certifications.length > 0 && (
            <div className="mb-4 space-y-2">
              {formData.certifications.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {cert.certificationName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cert.issuingAuthority}
                    </p>
                    <p className="text-xs text-gray-400">{cert.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCertification(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Add Certification
            </h4>
            <div className="mb-3">
              <input
                type="text"
                name="certificationName"
                value={currentCert.certificationName}
                onChange={handleCertificationInputChange}
                placeholder="Certification Name"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                name="issuingAuthority"
                value={currentCert.issuingAuthority}
                onChange={handleCertificationInputChange}
                placeholder="Issuing Authority"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="mb-3">
              <input
                type="file"
                onChange={handleCertificationFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                id="cert-file"
              />
              <label
                htmlFor="cert-file"
                className="flex items-center justify-between w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
              >
                <span className="text-gray-500">
                  {currentCert.file ? currentCert.file.name : "Choose file"}
                </span>
                <span className="text-emerald-600">Browse</span>
              </label>
              <p className="text-xs text-gray-400 mt-1">
                PDF, PNG or JPG (max. 5MB)
              </p>
            </div>
            <button
              type="button"
              onClick={addCertification}
              disabled={
                !currentCert.certificationName ||
                !currentCert.issuingAuthority ||
                !currentCert.file
              }
              className="w-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add Certification
            </button>
          </div>
        </div>
      </>
    );
  };

  const renderCompanyFields = () => {
    return (
      <>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Company Name *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </span>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Legal business name"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Company Registration Number *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </span>
            <input
              type="text"
              name="companyid"
              value={formData.companyid}
              onChange={handleInputChange}
              placeholder="CRN-0000-0000"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Business Email Address *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="contact@company.com"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
              required
            />
          </div>
        </div>

        {/* <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Verification Code *</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </span>
                            <input type="text" value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit code" maxLength={6}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
                                required />
                        </div>
                        <button type="button" onClick={handleRequestCode} disabled={isSendingCode || !formData.email}
                            className="px-4 py-3.5 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-200 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[100px]">
                            {isSendingCode ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Sending
                                </span>
                            ) : codeSent ? "Resend" : "Get Code"}
                        </button>
                    </div> */}
        {/* {codeSent && <p className="text-xs text-emerald-600 mt-1">Code sent! Check your email.</p>}
                </div> */}
      </>
    );
  };

  const renderPublicUserFields = () => {
    return (
      <>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            First Name *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </span>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="John"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Last Name *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </span>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Doe"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john.doe@example.com"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Phone Number *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </span>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="1234567890"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
              required
              pattern="[0-9]{10,15}"
            />
          </div>
        </div>
      </>
    );
  };

  const renderFields = () => {
    switch (role) {
      case "Technician":
        return renderTechnicianFields();
      case "Company":
        return renderCompanyFields();
      default:
        return renderPublicUserFields();
    }
  };

  const renderFooterLinks = () => {
    switch (role) {
      case "Technician":
        return (
          <p className="text-xs text-gray-500 leading-relaxed">
            I agree to the{" "}
            <Link
              href="#"
              className="text-emerald-500 font-semibold hover:text-emerald-600 transition"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="#"
              className="text-emerald-500 font-semibold hover:text-emerald-600 transition"
            >
              Professional Code of Conduct
            </Link>
          </p>
        );
      default:
        return (
          <p className="text-xs text-gray-500 leading-relaxed">
            By signing up, I agree to the Ministry's{" "}
            <Link
              href="#"
              className="text-emerald-500 font-semibold hover:text-emerald-600 transition underline decoration-emerald-200 underline-offset-2"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="#"
              className="text-emerald-500 font-semibold hover:text-emerald-600 transition underline decoration-emerald-200 underline-offset-2"
            >
              Data Protection Policy
            </Link>
            .
          </p>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[550px] p-6 sm:p-10 sm:py-8">
      {renderHeader()}

      <div className="flex bg-gray-100 rounded-xl p-1 mb-6 gap-1">
        {roles.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setRole(item);
              setVerificationCode("");
              setCodeSent(false);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              role === item
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="overflow-y-auto max-h-[70vh] pr-2 -mr-2 scrollbar-hide">
          {renderFields()}

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4.5 w-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                minLength={6}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-12 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943-9.543-7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Confirm Password *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4.5 w-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-12 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943-9.543-7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-6">
            <button
              type="button"
              onClick={() => setAgreeTerms(!agreeTerms)}
              className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${
                agreeTerms
                  ? "bg-emerald-600 border-emerald-600"
                  : "border-gray-300 bg-white"
              }`}
            >
              {agreeTerms && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
            {renderFooterLinks()}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-4 rounded-xl text-base font-bold shadow-lg shadow-emerald-100 transition-all duration-200 flex items-center justify-center gap-2 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </div>
            ) : (
              <>
                {role === "Technician"
                  ? "Create Technician Account"
                  : role === "Company"
                    ? "Create Company Account"
                    : "Create Account"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500 pb-2">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-emerald-500 font-bold hover:text-emerald-600 transition inline-flex items-center gap-1"
            >
              Sign In →
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
