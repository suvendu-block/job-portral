"use client";

import { useEffect, useState } from "react";
import {
  UserCircle,
  Plus,
  X,
  Link as LinkIcon,
  Briefcase,
  GraduationCap,
  PencilSimple,
  Check,
} from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import { useRoleGuard } from "@/lib/useRoleGuard";
import { apiGet, apiPut } from "@/lib/api";
import { Field } from "@/components/Field";

const EMPTY_PROFILE = {
  bio: "",
  skills: [],
  experience: [],
  education: [],
  links: { website: "", linkedin: "", github: "" },
};

const EMPTY_EXP = { title: "", company: "", location: "", from: "", to: "", description: "" };
const EMPTY_EDU = { school: "", degree: "", field: "", from: "", to: "" };

export default function ProfilePage() {
  useRoleGuard();
  const { user } = useAuth();

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Editable fields
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [links, setLinks] = useState({ website: "", linkedin: "", github: "" });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet("/profile/me");
        if (cancelled) return;
        const p = data.profile;
        setProfile(p);
        setBio(p.bio || "");
        setSkills(p.skills || []);
        setExperience(p.experience || []);
        setEducation(p.education || []);
        setLinks(p.links || { website: "", linkedin: "", github: "" });
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  function addSkill() {
    const val = skillInput.trim();
    if (val && !skills.includes(val)) {
      setSkills((s) => [...s, val]);
      setSkillInput("");
    }
  }

  function removeSkill(skill) {
    setSkills((s) => s.filter((x) => x !== skill));
  }

  function addExperience() {
    setExperience((e) => [...e, { ...EMPTY_EXP }]);
  }

  function updateExperience(index, field, value) {
    setExperience((e) => e.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function removeExperience(index) {
    setExperience((e) => e.filter((_, i) => i !== index));
  }

  function addEducation() {
    setEducation((e) => [...e, { ...EMPTY_EDU }]);
  }

  function updateEducation(index, field, value) {
    setEducation((e) => e.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function removeEducation(index) {
    setEducation((e) => e.filter((_, i) => i !== index));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const data = await apiPut("/profile", {
        bio,
        skills,
        experience,
        education,
        links,
      });
      setProfile(data.profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Profile</h1>
          <p className="mt-1 text-sm text-muted">
            Manage your public profile information
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-ok">
              <Check size={16} /> Saved
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-4 w-32 rounded bg-ink/10" />
              <div className="mt-3 skeleton h-20 w-full rounded bg-ink/10" />
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-bad/30 bg-bad/5 px-4 py-3 text-sm text-bad" role="alert">
              {error}
            </div>
          )}

          {/* Header card */}
          <div className="card flex items-center gap-4 p-6">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-ink text-xl font-bold text-paper">
              {user.name?.charAt(0).toUpperCase()}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink">{user.name}</h2>
              <p className="text-sm text-muted">{user.email}</p>
              <span className="chip mt-1 border-line-strong bg-ink/[0.03] text-ink-soft">
                {user.role}
              </span>
            </div>
          </div>

          {/* Bio */}
          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
              <UserCircle size={18} aria-hidden="true" />
              About you
            </h3>
            <Field label="Bio" hint="A short summary about yourself">
              <textarea
                className="input min-h-[100px] resize-y"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Full-stack developer with 5 years of experience..."
                maxLength={1000}
              />
              <span className="hint">{bio.length}/1000</span>
            </Field>
          </div>

          {/* Skills */}
          <div className="card p-6">
            <h3 className="mb-4 text-base font-semibold text-ink">Skills</h3>
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add a skill and press Enter"
              />
              <button type="button" onClick={addSkill} className="btn btn-secondary">
                Add
              </button>
            </div>
            {skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className="chip border-line-strong bg-ink/[0.03] text-ink-soft">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-0.5 rounded-full p-0.5 text-muted transition hover:text-bad"
                      aria-label={`Remove ${skill}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Experience */}
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
                <Briefcase size={18} aria-hidden="true" />
                Experience
              </h3>
              <button type="button" onClick={addExperience} className="btn btn-ghost text-sm">
                <Plus size={16} /> Add
              </button>
            </div>
            {experience.length === 0 && (
              <p className="text-sm text-muted">No experience added yet.</p>
            )}
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={i} className="relative rounded-xl border border-line p-4">
                  <button
                    type="button"
                    onClick={() => removeExperience(i)}
                    className="absolute right-3 top-3 text-muted transition hover:text-bad"
                    aria-label="Remove experience"
                  >
                    <X size={16} />
                  </button>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Title">
                      <input
                        className="input"
                        value={exp.title}
                        onChange={(e) => updateExperience(i, "title", e.target.value)}
                        placeholder="Software Engineer"
                      />
                    </Field>
                    <Field label="Company">
                      <input
                        className="input"
                        value={exp.company}
                        onChange={(e) => updateExperience(i, "company", e.target.value)}
                        placeholder="Acme Corp"
                      />
                    </Field>
                    <Field label="Location">
                      <input
                        className="input"
                        value={exp.location}
                        onChange={(e) => updateExperience(i, "location", e.target.value)}
                        placeholder="San Francisco, CA"
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="From">
                        <input
                          className="input"
                          value={exp.from}
                          onChange={(e) => updateExperience(i, "from", e.target.value)}
                          placeholder="Jan 2023"
                        />
                      </Field>
                      <Field label="To">
                        <input
                          className="input"
                          value={exp.to}
                          onChange={(e) => updateExperience(i, "to", e.target.value)}
                          placeholder="Present"
                        />
                      </Field>
                    </div>
                    <Field label="Description" className="sm:col-span-2">
                      <textarea
                        className="input min-h-[60px] resize-y"
                        value={exp.description}
                        onChange={(e) => updateExperience(i, "description", e.target.value)}
                        placeholder="What did you do in this role?"
                        maxLength={500}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
                <GraduationCap size={18} aria-hidden="true" />
                Education
              </h3>
              <button type="button" onClick={addEducation} className="btn btn-ghost text-sm">
                <Plus size={16} /> Add
              </button>
            </div>
            {education.length === 0 && (
              <p className="text-sm text-muted">No education added yet.</p>
            )}
            <div className="space-y-4">
              {education.map((edu, i) => (
                <div key={i} className="relative rounded-xl border border-line p-4">
                  <button
                    type="button"
                    onClick={() => removeEducation(i)}
                    className="absolute right-3 top-3 text-muted transition hover:text-bad"
                    aria-label="Remove education"
                  >
                    <X size={16} />
                  </button>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="School">
                      <input
                        className="input"
                        value={edu.school}
                        onChange={(e) => updateEducation(i, "school", e.target.value)}
                        placeholder="MIT"
                      />
                    </Field>
                    <Field label="Degree">
                      <input
                        className="input"
                        value={edu.degree}
                        onChange={(e) => updateEducation(i, "degree", e.target.value)}
                        placeholder="B.S."
                      />
                    </Field>
                    <Field label="Field of study">
                      <input
                        className="input"
                        value={edu.field}
                        onChange={(e) => updateEducation(i, "field", e.target.value)}
                        placeholder="Computer Science"
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="From">
                        <input
                          className="input"
                          value={edu.from}
                          onChange={(e) => updateEducation(i, "from", e.target.value)}
                          placeholder="Sep 2019"
                        />
                      </Field>
                      <Field label="To">
                        <input
                          className="input"
                          value={edu.to}
                          onChange={(e) => updateEducation(i, "to", e.target.value)}
                          placeholder="Jun 2023"
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
              <LinkIcon size={18} aria-hidden="true" />
              Links
            </h3>
            <div className="space-y-3">
              <Field label="Website" hint="Personal website or portfolio">
                <input
                  className="input"
                  value={links.website}
                  onChange={(e) => setLinks((l) => ({ ...l, website: e.target.value }))}
                  placeholder="https://yoursite.com"
                />
              </Field>
              <Field label="LinkedIn">
                <input
                  className="input"
                  value={links.linkedin}
                  onChange={(e) => setLinks((l) => ({ ...l, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourname"
                />
              </Field>
              <Field label="GitHub">
                <input
                  className="input"
                  value={links.github}
                  onChange={(e) => setLinks((l) => ({ ...l, github: e.target.value }))}
                  placeholder="https://github.com/yourname"
                />
              </Field>
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center justify-end gap-3 pb-8">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              <PencilSimple size={16} />
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
