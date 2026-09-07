import { useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

interface SetupScreenProps {
    onComplete: () => void;
}

export function SetupScreen({ onComplete }: SetupScreenProps) {
    const [githubToken, setGithubToken] = useState("");
    const [geminiKey, setGeminiKey] = useState("");
    const [githubValid, setGithubValid] = useState<boolean | null>(null);
    const [geminiValid, setGeminiValid] = useState<boolean | null>(null);
    const [checking, setChecking] = useState<"github" | "gemini" | null>(null);
    const [saving, setSaving] = useState(false);

    async function testGithub() {
        setChecking("github");
        try {
            const res = await fetch(
                `${API_BASE}/api/setup/test-github-token?token=${encodeURIComponent(githubToken)}`,
                { method: "POST" }
            );
            const data = await res.json();
            setGithubValid(data.valid);
        } finally {
            setChecking(null);
        }
    }

    async function testGemini() {
        setChecking("gemini");
        try {
            const res = await fetch(
                `${API_BASE}/api/setup/test-gemini-key?key=${encodeURIComponent(geminiKey)}`,
                { method: "POST" }
            );
            const data = await res.json();
            setGeminiValid(data.valid);
        } finally {
            setChecking(null);
        }
    }

    async function handleContinue() {
        setSaving(true);
        try {
            await fetch(`${API_BASE}/api/setup/github-token?token=${encodeURIComponent(githubToken)}`, {
                method: "POST",
            });
            await fetch(`${API_BASE}/api/setup/gemini-key?key=${encodeURIComponent(geminiKey)}`, {
                method: "POST",
            });
            onComplete();
        } finally {
            setSaving(false);
        }
    }

    const canContinue = githubValid === true && geminiValid === true && !saving;

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
            <div className="max-w-lg w-full space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Welcome to Project Autopsy</h1>
                    <p className="text-neutral-400 mt-2">
                        Two keys are needed before we can start. Both stay on your machine.
                    </p>
                </div>

                {/* GitHub Token */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">GitHub Personal Access Token</label>
                    <ol className="text-xs text-neutral-500 list-decimal list-inside space-y-1">
                        <li>Go to github.com/settings/tokens</li>
                        <li>Click "Generate new token (classic)"</li>
                        <li>Check the "repo" scope box</li>
                        <li>Generate and copy the token here</li>
                    </ol>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            value={githubToken}
                            onChange={(e) => {
                                setGithubToken(e.target.value);
                                setGithubValid(null);
                            }}
                            placeholder="ghp_..."
                            className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm"
                        />
                        <button
                            onClick={testGithub}
                            disabled={!githubToken || checking === "github"}
                            className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded text-sm whitespace-nowrap"
                        >
                            {checking === "github" ? "Checking..." : "Test"}
                        </button>
                    </div>
                    {githubValid === true && <p className="text-green-400 text-xs">✓ Valid token</p>}
                    {githubValid === false && <p className="text-red-400 text-xs">✗ Invalid token</p>}
                </div>

                {/* Gemini Key */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Google Gemini API Key</label>
                    <ol className="text-xs text-neutral-500 list-decimal list-inside space-y-1">
                        <li>Go to aistudio.google.com/apikey</li>
                        <li>Click "Create API key"</li>
                        <li>Copy the key here</li>
                    </ol>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            value={geminiKey}
                            onChange={(e) => {
                                setGeminiKey(e.target.value);
                                setGeminiValid(null);
                            }}
                            placeholder="AIza..."
                            className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm"
                        />
                        <button
                            onClick={testGemini}
                            disabled={!geminiKey || checking === "gemini"}
                            className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded text-sm whitespace-nowrap"
                        >
                            {checking === "gemini" ? "Checking..." : "Test"}
                        </button>
                    </div>
                    {geminiValid === true && <p className="text-green-400 text-xs">✓ Valid key</p>}
                    {geminiValid === false && <p className="text-red-400 text-xs">✗ Invalid key</p>}
                </div>

                <button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 py-3 rounded font-medium"
                >
                    {saving ? "Saving..." : "Continue to Dashboard"}
                </button>
            </div>
        </div>
    );
}