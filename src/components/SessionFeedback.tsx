"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface SessionFeedbackProps {
    sessionId: string;
    onClose: () => void;
}

export default function SessionFeedback({ sessionId, onClose }: SessionFeedbackProps) {
    const [feedback, setFeedback] = useState<boolean | null>(null);
    const [comment, setComment] = useState("");
    const [shiftScore, setShiftScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const supabase = createClientComponentClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/session/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sessionId,
                    feedback,
                    comment: comment || undefined,
                    shiftScore: shiftScore || undefined,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit feedback");
            }

            setSubmitted(true);

            // Close after a short delay
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("Failed to submit feedback. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank you!</h3>
                    <p className="text-gray-600">Your feedback helps us improve EDEM.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">How was your session?</h3>

            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <p className="text-gray-700 mb-4">Did this session help you feel better?</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            type="button"
                            onClick={() => setFeedback(true)}
                            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${feedback === true
                                    ? "border-green-500 bg-green-50 text-green-700"
                                    : "border-gray-200 hover:border-green-300"
                                }`}
                        >
                            <div className="font-medium">Yes, it helped</div>
                            <div className="text-sm">Стало легче</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFeedback(false)}
                            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${feedback === false
                                    ? "border-red-500 bg-red-50 text-red-700"
                                    : "border-gray-200 hover:border-red-300"
                                }`}
                        >
                            <div className="font-medium">Not really</div>
                            <div className="text-sm">Не помогло</div>
                        </button>
                    </div>
                </div>

                {feedback !== null && (
                    <>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                How much did you feel a shift? (0-10)
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">0</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={shiftScore || 5}
                                    onChange={(e) => setShiftScore(parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-sm text-gray-500">10</span>
                                <span className="w-8 text-center font-medium">{shiftScore !== null ? shiftScore : "-"}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>No change</span>
                                <span>Major shift</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                                Any comments? (Optional)
                            </label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="What worked well? What could be better?"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Skip
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Sending..." : "Submit"}
                            </button>
                        </div>
                    </>
                )}

                {feedback === null && (
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-2 px-4 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Skip for now
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}