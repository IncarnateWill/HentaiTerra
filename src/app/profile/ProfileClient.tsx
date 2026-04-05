"use client";

import { useState } from "react";
import { SignInButton } from "@clerk/nextjs";
import { 
  FaDiscord, 
  FaInstagram, 
  FaYoutube, 
  FaTwitch, 
  FaUserAlt, 
  FaLink,
  FaEdit,
  FaSave,
  FaTimes,
  FaEye,
  FaArrowLeft,
  FaCrown,
  FaShieldAlt,
  FaStar,
  FaHandsHelping,
  FaUser
} from "react-icons/fa";
import Image from "next/image";
import { logToDiscordWebhook } from "@/lib/discord-webhook";

const defaultSocial = {
  discord: '',
  instagram: '',
  youtube: '',
  twitch: '',
};

// Map social platforms to their respective icons
const socialIcons = {
  discord: FaDiscord,
  instagram: FaInstagram,
  youtube: FaYoutube,
  twitch: FaTwitch,
};

// Role grouping and rendering logic
const ADMIN_ROLES = ['owner', 'co-owner', 'admin'];
const STAFF_ROLES = ['staff', 'verificator', 'encoder', 'traducator', 'editormanga', 'verificatormanga', 'traducatormanga'];

function getRoleGroups(roles: string[]) {
  const admin: string[] = [];
  const staff: string[] = [];
  const other: string[] = [];
  for (const role of roles) {
    const r = role.toLowerCase();
    if (ADMIN_ROLES.includes(r)) admin.push(role);
    else if (STAFF_ROLES.includes(r)) staff.push(role);
    else other.push(role);
  }
  return { admin, staff, other };
}

// Preview component that shows how others see your profile
const ProfilePreview = ({ user, onClose }: { user: any; onClose: () => void }) => {
  const previewRoles = Array.isArray(user.roles) && user.roles.length > 0
    ? user.roles
    : user.role
      ? [user.role]
      : ['user'];
  const { admin: previewAdmin, staff: previewStaff, other: previewOther } = getRoleGroups(previewRoles);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="w-full max-w-3xl relative">
        {/* Preview header with close button */}
        <div className="bg-[#1E1A2E] rounded-t-xl p-4 flex items-center justify-between border-b border-purple-900/30">
          <div className="flex items-center">
            <FaEye className="text-purple-400 mr-2" />
            <h3 className="text-white font-medium">Previzualizare Profil</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors bg-purple-900/20 hover:bg-purple-900/40 rounded-full p-2"
          >
            <FaArrowLeft />
          </button>
        </div>

        {/* Preview content */}
        <div className="bg-gradient-to-b from-[#1E1A2E] to-[#272336] rounded-b-xl shadow-lg overflow-hidden">
          {/* Profile header with gradient background */}
          <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile image */}
              <div className="relative">
                <div className="w-32 h-32 border-4 border-purple-700/50 rounded-full p-1 bg-[#1E1A2E] shadow-xl">
                  <Image
                    src={user.imageUrl || "/default-pfp.png"}
                    alt={`Poza de profil a utilizatorului ${user.username}`}
                    className="rounded-full object-cover w-full h-full"
                    width={128}
                    height={128}
                  />
                </div>
              </div>
              
              {/* User info */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold text-white bg-clip-text bg-gradient-to-r from-white to-purple-300">
                  {user.username}
                </h1>
                
                <div className="flex flex-col gap-2 mt-2 justify-center md:justify-start items-start">
                  {previewAdmin.length > 0 && (
                    <div className="mb-1">
                      <div className="text-xs uppercase tracking-wider text-yellow-300/80 font-semibold mb-1 ml-1">Administrative roles:</div>
                      <div className="flex flex-wrap gap-2 items-center">
                        {previewAdmin.map((role, idx) => (
                          <span key={role + idx} className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 text-xs text-white font-bold border-2 border-yellow-400 shadow-md animate-pulse uppercase tracking-wide">
                            {role.toLowerCase() === 'owner' ? <FaCrown className="w-4 h-4 mr-1 text-yellow-300" /> : <FaShieldAlt className="w-4 h-4 mr-1 text-purple-200" />} {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {previewStaff.length > 0 && (
                    <div className="mb-1">
                      <div className="text-xs uppercase tracking-wider text-purple-300/80 font-semibold mb-1 ml-1">Staff roles:</div>
                      <div className="flex flex-wrap gap-2 items-center">
                        {previewStaff.map((role, idx) => (
                          <span key={role + idx} className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-800/80 text-xs text-purple-100 font-bold border border-purple-500 shadow-sm uppercase tracking-wide">
                            <FaHandsHelping className="w-4 h-4 mr-1 text-blue-300" /> {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {previewOther.length > 0 && (
                    <div className="mb-1">
                      <div className="text-xs uppercase tracking-wider text-gray-400/80 font-semibold mb-1 ml-1">Other roles:</div>
                      <div className="flex flex-wrap gap-2 items-center">
                        {previewOther.map((role, idx) => (
                          <span key={role + idx} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-800 text-xs text-gray-200 font-bold border border-gray-600 uppercase tracking-wide">
                            <FaUser className="w-3 h-3 mr-1 text-gray-400" /> {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 text-gray-400 text-sm">
                  Pasionat de anime
                </div>
                
                {/* Bio with styled container */}
                {user.bio ? (
                  <div className="mt-4 bg-purple-900/10 border border-purple-900/20 rounded-lg p-3">
                    <p className="text-gray-300 italic">&quot;{user.bio}&quot;</p>
                  </div>
                ) : (
                  <div className="mt-4 bg-neutral-900/50 border border-neutral-800 rounded-lg p-3">
                    <p className="text-gray-500 italic">Acest utilizator nu a adăugat încă o descriere</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Social links */}
          <div className="p-6">
            <div className="mt-2">
              <h3 className="text-gray-300 text-lg font-medium mb-3 flex items-center">
                <FaLink className="mr-2 text-purple-500" /> Rețele Sociale
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(defaultSocial).map((platform) => {
                  const Icon = socialIcons[platform as keyof typeof socialIcons] || FaLink;
                  const link = user.social?.[platform];
                  
                  return (
                    <div 
                      key={platform} 
                      className={`flex items-center p-3 rounded-lg ${
                        link ? 'bg-purple-900/20' : 'bg-neutral-900/50'
                      }`}
                    >
                      <Icon className={`text-xl mr-3 ${link ? 'text-purple-400' : 'text-gray-500'}`} />
                      <div className="flex-1">
                        <p className="text-gray-400 text-xs mb-1 capitalize">{platform}</p>
                        {link ? (
                          <span className="text-gray-200 text-sm break-all">{link}</span>
                        ) : (
                          <span className="text-gray-500 text-sm">Nesetat</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Activity section */}
            <div className="mt-8 border-t border-purple-900/20 pt-6">
              <h3 className="text-gray-300 text-lg font-medium mb-4">Activitate</h3>
              
              <div className="bg-neutral-900/40 rounded-lg p-6 text-center">
                <p className="text-gray-400">Nu există activitate recentă de afișat</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProfileClient({ user, heading }: { user: any, heading?: string }) {
  const [profile, setProfile] = useState<any>(user);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<any>({
    bio: user.bio || '',
    social: { ...defaultSocial, ...(user.social || {}) },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validate form input
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Bio validation
    if (form.bio && form.bio.length > 200) {
      errors.bio = "Bio cannot exceed 200 characters";
    }
    
    // Social media validation
    Object.entries(form.social).forEach(([platform, url]) => {
      const value = url as string;
      if (value && value.length > 100) {
        errors[`social.${platform}`] = `${platform} URL cannot exceed 100 characters`;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    
    if (name.startsWith("social.")) {
      const platform = name.split(".")[1];
      setForm((prev: any) => ({
        ...prev,
        social: { ...prev.social, [platform]: value },
      }));
      
      // Clear validation error for this social field
      if (validationErrors[`social.${platform}`]) {
        setValidationErrors(prev => {
          const updated = { ...prev };
          delete updated[`social.${platform}`];
          return updated;
        });
      }
    } else {
      setForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setError("Please fix the validation errors before saving");
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setProfile(data.user);
        setEdit(false);
        setSuccess("Profile updated successfully!");
        
        // Trigger a hard refresh after a short delay to show the success message
        setTimeout(() => {
          window.location.reload();
        }, 20);
      } else {
        setError(data.error || "Failed to update profile.");
        
        // Handle validation errors from the server
        if (data.details) {
          setValidationErrors(data.details);
        }
      }
    } catch (error) {
      await logToDiscordWebhook(`Error updating profile: ${error}`);
      setError("Network error. Please try again later.");
    } finally {
      setSaving(false);
    }
  };

  // Function to safely display text (prevents XSS)
  const safeText = (text: string | undefined | null) => {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  if (!profile) return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-[#1E1A2E]/80 rounded-xl p-8 text-center max-w-md shadow-lg border border-purple-900/30">
        <FaUserAlt className="text-red-400 text-5xl mx-auto mb-4 opacity-70" />
        <h2 className="text-2xl font-bold text-red-400 mb-4">Autentificare Necesară</h2>
        <p className="text-gray-400 mb-6">Trebuie să fii autentificat pentru a-ți vedea profilul.</p>
        <div className="flex justify-center">
          <SignInButton>
            <button className="px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium flex items-center">
              <FaUserAlt className="mr-2" /> Autentificare
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );

  // Prepare the preview data - use form data if in edit mode, otherwise use profile data
  const previewData = {
    ...profile,
    bio: edit ? form.bio : profile.bio,
    social: edit ? form.social : profile.social,
  };

  // Add debug print
  console.debug('Profile object:', profile);

  const allRoles = Array.isArray(profile.roles) && profile.roles.length > 0
    ? profile.roles
    : profile.role
      ? [profile.role]
      : ['user'];
  const { admin, staff, other } = getRoleGroups(allRoles);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {showPreview && (
        <ProfilePreview 
          user={previewData} 
          onClose={() => setShowPreview(false)} 
        />
      )}
      
      <div className="bg-gradient-to-b from-[#1E1A2E] to-[#272336] rounded-xl shadow-lg overflow-hidden">
        {/* Profile header with gradient background */}
        <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile image with animated border on hover */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 animate-pulse opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
              <div className="relative w-32 h-32 border-4 border-purple-700/50 rounded-full p-1 bg-[#1E1A2E] shadow-xl">
                <Image
                  src={profile.imageUrl || '/default-pfp.png'}
                  alt="Poză de Profil"
                  className="rounded-full object-cover w-full h-full"
                  width={128}
                  height={128}
                />
              </div>
            </div>
            
            {/* User info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-white bg-clip-text bg-gradient-to-r from-white to-purple-300">
                {heading || safeText(profile.username)}
              </h1>
              
              <div className="flex flex-col gap-2 mt-2 justify-center md:justify-start items-start">
                {admin.length > 0 && (
                  <div className="mb-1">
                    <div className="text-xs uppercase tracking-wider text-yellow-300/80 font-semibold mb-1 ml-1">Administrative roles:</div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {admin.map((role, idx) => (
                        <span key={role + idx} className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 text-xs text-white font-bold border-2 border-yellow-400 shadow-md animate-pulse uppercase tracking-wide">
                          {role.toLowerCase() === 'owner' ? <FaCrown className="w-4 h-4 mr-1 text-yellow-300" /> : <FaShieldAlt className="w-4 h-4 mr-1 text-purple-200" />} {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {staff.length > 0 && (
                  <div className="mb-1">
                    <div className="text-xs uppercase tracking-wider text-purple-300/80 font-semibold mb-1 ml-1">Staff roles:</div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {staff.map((role, idx) => (
                        <span key={role + idx} className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-800/80 text-xs text-purple-100 font-bold border border-purple-500 shadow-sm uppercase tracking-wide">
                          <FaHandsHelping className="w-4 h-4 mr-1 text-blue-300" /> {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {other.length > 0 && (
                  <div className="mb-1">
                    <div className="text-xs uppercase tracking-wider text-gray-400/80 font-semibold mb-1 ml-1">Other roles:</div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {other.map((role, idx) => (
                        <span key={role + idx} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-800 text-xs text-gray-200 font-bold border border-gray-600 uppercase tracking-wide">
                          <FaUser className="w-3 h-3 mr-1 text-gray-400" /> {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-2 text-gray-400 text-sm">
                {safeText(profile.email)}
              </div>
              
              {/* Preview button */}
              <button
                onClick={handlePreview}
                className="mt-3 flex items-center text-xs bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 px-3 py-1.5 rounded-full transition-colors"
              >
                <FaEye className="mr-1" /> Previzualizează Profilul Public
              </button>
            </div>
          </div>
        </div>
        
        {/* Form Content */}
        <form onSubmit={handleSave} className="p-6">
          {/* Bio section */}
          <div className="mb-6">
            <label className="flex items-center text-gray-300 mb-2 text-lg font-medium">
              <FaUserAlt className="mr-2 text-purple-500" /> Bio
            </label>
            {edit ? (
              <div className="relative">
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg bg-neutral-900/80 text-gray-100 border ${
                    validationErrors.bio 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' 
                      : 'border-purple-700/50 focus:border-purple-500 focus:ring-purple-500/30'
                  } focus:outline-none focus:ring-2 transition-all`}
                  rows={3}
                  maxLength={200}
                  placeholder="Spune-le celorlalți despre tine..."
                />
                <div className="flex justify-between">
                  <span className={`text-xs ${validationErrors.bio ? 'text-red-400' : 'text-gray-500'}`}>
                    {validationErrors.bio || ''}
                  </span>
                  <span className="text-xs text-gray-500">
                    {form.bio.length}/200
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-purple-900/10 border border-purple-900/20 rounded-lg p-3 min-h-[70px]">
                {profile.bio ? (
                  <p className="text-gray-300">{safeText(profile.bio)}</p>
                ) : (
                  <p className="text-gray-500 italic">Adaugă o descriere pentru a le spune celorlalți despre tine</p>
                )}
              </div>
            )}
          </div>
          
          {/* Profile Image Disclaimer */}
          <div className="mb-6 bg-red-900/20 border border-red-700/30 rounded-lg p-3">
            <p className="text-red-400 text-sm flex items-start">
              <FaUserAlt className="mr-2 mt-0.5 flex-shrink-0" /> 
              <span>
                <strong>Notă:</strong> Pentru a schimba imaginea de profil, apasă pe avatarul din colțul din dreapta sus al paginii.
              </span>
            </p>
          </div>
          
          {/* Social Links */}
          <div className="mb-6">
            <label className="flex items-center text-gray-300 mb-2 text-lg font-medium">
              <FaLink className="mr-2 text-purple-500" /> Social
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(defaultSocial).map((platform) => {
                const Icon = socialIcons[platform as keyof typeof socialIcons] || FaLink;
                const errorKey = `social.${platform}`;
                
                return (
                  <div key={platform} className="mb-2">
                    <label className="flex items-center text-gray-400 text-sm mb-1.5 capitalize">
                      <Icon className="mr-1.5 text-purple-400/70" /> {platform}
                    </label>
                    {edit ? (
                      <div>
                        <input
                          type="text"
                          name={`social.${platform}`}
                          value={form.social[platform] || ''}
                          onChange={handleChange}
                          className={`w-full p-2.5 rounded-lg bg-neutral-900/80 text-gray-100 border ${
                            validationErrors[errorKey] 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' 
                              : 'border-purple-700/50 focus:border-purple-500 focus:ring-purple-500/30'
                          } focus:outline-none focus:ring-2 transition-all`}
                          placeholder={`Numele tău de utilizator ${platform}`}
                          maxLength={100}
                        />
                        {validationErrors[errorKey] && (
                          <span className="text-xs text-red-400">{validationErrors[errorKey]}</span>
                        )}
                      </div>
                    ) : (
                      <div className={`flex items-center p-2.5 rounded-lg ${
                        profile.social?.[platform] ? 'bg-purple-900/20' : 'bg-neutral-900/50'
                      }`}>
                        <Icon className={`text-lg mr-2 ${profile.social?.[platform] ? 'text-purple-400' : 'text-gray-500'}`} />
                        <span className="text-gray-200 break-all">
                          {profile.social?.[platform] ? safeText(profile.social[platform]) : <span className="text-gray-500">Nesetat</span>}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Success/Error messages */}
          {success && (
            <div className="mb-4 bg-green-900/20 border border-green-700/30 text-green-400 p-3 rounded-lg flex items-center">
              <FaSave className="mr-2" /> {success === "Profile updated successfully!" ? "Profilul a fost actualizat cu succes!" : success}
            </div>
          )}
          
          {error && (
            <div className="mb-4 bg-red-900/20 border border-red-700/30 text-red-400 p-3 rounded-lg flex items-center">
              <FaTimes className="mr-2" /> {error === "Failed to update profile." ? "Actualizarea profilului a eșuat." : error}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-purple-900/20">
            {edit ? (
              <>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-gray-300 hover:bg-neutral-700 transition-colors flex items-center"
                  onClick={() => { 
                    setEdit(false); 
                    setForm({ 
                      bio: profile.bio, 
                      social: { ...defaultSocial, ...(profile.social || {}) } 
                    }); 
                  }}
                  disabled={saving}
                >
                  <FaTimes className="mr-1.5" /> Anulează
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-700 text-white hover:bg-purple-600 transition-colors disabled:opacity-60 flex items-center"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Se salvează...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-1.5" /> Salvează Modificările
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-purple-700 text-white hover:bg-purple-600 transition-colors flex items-center"
                onClick={() => { setEdit(true); }}
              >
                <FaEdit className="mr-1.5" /> Editează Profilul
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}