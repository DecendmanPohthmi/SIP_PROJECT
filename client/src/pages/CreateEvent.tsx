import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BsImage,
  BsCalendarEvent,
  BsGeoAlt,
  BsPeopleFill,
  BsCashStack,
} from "react-icons/bs";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [totalCapacity, setTotalCapacity] = useState("");
  const [pricingMode, setPricingMode] = useState<"free" | "paid">("paid");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (
      !title ||
      !description ||
      !category ||
      !venue ||
      !city ||
      !eventDate ||
      !startTime ||
      !endTime ||
      !totalCapacity
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("venue", venue);
      formData.append("city", city);
      formData.append("event_date", eventDate);
      formData.append("start_time", startTime);
      formData.append("end_time", endTime);
      formData.append("total_capacity", totalCapacity);
      formData.append("pricing_mode", pricingMode);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch(`${API}/api/events/create`, {
        method: "POST",
        headers: {
          token: token || "",
        },
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to create event");
      }

      setSuccess(true);
      setTimeout(() => navigate("/organiser/dashboard"), 1500);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-4 sm:mt-8 px-4 sm:px-6 pb-16">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Create Event
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Fill in the details below. Your event will be reviewed before going live.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 sm:p-8 space-y-5 sm:space-y-6"
      >
        {/* Image Upload + Preview */}
        <div>
          <label className="flex items-center gap-2 font-semibold mb-2 text-slate-700 text-sm sm:text-base">
            <BsImage size={16} />
            Event Image (optional)
          </label>

          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
            className="w-full text-sm sm:text-base border border-gray-300 rounded-lg p-2.5 sm:p-3 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-medium hover:file:bg-slate-200"
          />
          <p className="text-xs text-gray-400 mt-1">
            JPG, PNG, or WEBP. Max 5MB.
          </p>

          {imagePreview && (
            <div className="mt-3 w-full h-40 sm:h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img
                src={imagePreview}
                alt="Event preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block font-semibold mb-2 text-slate-700 text-sm sm:text-base">
            Event Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Tech Conference 2026"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base focus:outline-none focus:border-slate-800"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-2 text-slate-700 text-sm sm:text-base">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell attendees what this event is about..."
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base resize-none focus:outline-none focus:border-slate-800"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block font-semibold mb-2 text-slate-700 text-sm sm:text-base">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base bg-white focus:outline-none focus:border-slate-800"
          >
            <option value="">Select a category</option>
            <option value="Music">Music</option>
            <option value="Concert">Concert</option>
            <option value="Technology">Technology</option>
            <option value="Conference">Conference</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Esports Tournament">Esports Tournament</option>
            <option value="Gaming">Gaming</option>
            <option value="Sports">Sports</option>
            <option value="Marathon">Marathon</option>
            <option value="Fitness">Fitness</option>
            <option value="Car Show">Car Show</option>
            <option value="Bike Show">Bike Show</option>
            <option value="Auto Expo">Auto Expo</option>
            <option value="Arts & Culture">Arts & Culture</option>
            <option value="Exhibition">Exhibition</option>
            <option value="Photography">Photography</option>
            <option value="Fashion Show">Fashion Show</option>
            <option value="Food & Drink">Food & Drink</option>
            <option value="Food Festival">Food Festival</option>
            <option value="Business">Business</option>
            <option value="Startup Pitch">Startup Pitch</option>
            <option value="Networking">Networking</option>
            <option value="Education">Education</option>
            <option value="Career Fair">Career Fair</option>
            <option value="Job Fair">Job Fair</option>
            <option value="College Fest">College Fest</option>
            <option value="Cultural Festival">Cultural Festival</option>
            <option value="Comedy Show">Comedy Show</option>
            <option value="Movie Screening">Movie Screening</option>
            <option value="Charity">Charity</option>
            <option value="Religious">Religious</option>
            <option value="Adventure">Adventure</option>
            <option value="Health & Wellness">Health & Wellness</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Venue + City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 font-semibold mb-2 text-slate-700 text-sm sm:text-base">
              <BsGeoAlt size={16} />
              Venue
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Convention Hall"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base focus:outline-none focus:border-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-slate-700 text-sm sm:text-base">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Shillong"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base focus:outline-none focus:border-slate-800"
            />
          </div>
        </div>

        {/* Date + Times */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-2 font-semibold mb-2 text-slate-700 text-sm sm:text-base">
              <BsCalendarEvent size={16} />
              Date
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base focus:outline-none focus:border-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-slate-700 text-sm sm:text-base">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base focus:outline-none focus:border-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-slate-700 text-sm sm:text-base">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base focus:outline-none focus:border-slate-800"
            />
          </div>
        </div>

        {/* Capacity + Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 font-semibold mb-2 text-slate-700 text-sm sm:text-base">
              <BsPeopleFill size={16} />
              Total Capacity
            </label>
            <input
              type="number"
              min="1"
              value={totalCapacity}
              onChange={(e) => setTotalCapacity(e.target.value)}
              placeholder="e.g. 200"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base focus:outline-none focus:border-slate-800"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-semibold mb-2 text-slate-700 text-sm sm:text-base">
              <BsCashStack size={16} />
              Pricing
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPricingMode("free")}
                className={`flex-1 py-3 rounded-lg border font-medium text-sm sm:text-base transition-colors ${
                  pricingMode === "free"
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                Free
              </button>
              <button
                type="button"
                onClick={() => setPricingMode("paid")}
                className={`flex-1 py-3 rounded-lg border font-medium text-sm sm:text-base transition-colors ${
                  pricingMode === "paid"
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                Paid
              </button>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && (
          <p className="text-emerald-600 text-sm font-medium">
            Event submitted! Redirecting to your dashboard...
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3.5 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Uploading..." : "Submit Event for Approval"}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;