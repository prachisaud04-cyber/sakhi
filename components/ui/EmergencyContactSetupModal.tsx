'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Check,
  Edit2,
  HeartHandshake,
  Phone,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { EmergencyContact } from '@/constants/contacts'

interface EmergencyContactSetupModalProps {
  isOpen: boolean
  onClose: () => void
}

const RELATION_OPTIONS = [
  'Mother',
  'Father',
  'Sister',
  'Brother',
  'Spouse / Partner',
  'Friend',
  'Guardian',
  'Police & Helpline',
  'Emergency Contact',
]

export const EmergencyContactSetupModal: React.FC<EmergencyContactSetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    contacts,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    setPrimaryEmergencyContact,
    user,
  } = useAuth()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [relation, setRelation] = useState('Mother')
  const [isPrimary, setIsPrimary] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleStartEdit = (c: EmergencyContact) => {
    setEditingId(c.id)
    setName(c.name)
    setPhone(c.phone)
    setRelation(c.relation)
    setIsPrimary(false)
    setErrorMessage(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setName('')
    setPhone('')
    setRelation('Mother')
    setIsPrimary(false)
    setErrorMessage(null)
  }

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim()) {
      setErrorMessage('Please enter the contact name')
      return
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 3) {
      setErrorMessage('Please enter a valid phone number')
      return
    }

    if (editingId) {
      const res = await updateEmergencyContact(editingId, {
        name: name.trim(),
        phone: phone.trim(),
        relation,
      })
      if (res.success) {
        setSuccessMessage('Contact updated successfully')
        setTimeout(() => setSuccessMessage(null), 2500)
        handleCancelEdit()
      } else {
        setErrorMessage(res.error || 'Failed to update contact')
      }
    } else {
      const res = await addEmergencyContact({
        name: name.trim(),
        phone: phone.trim(),
        relation,
        isPrimary,
      })
      if (res.success) {
        setSuccessMessage('Contact added successfully')
        setTimeout(() => setSuccessMessage(null), 2500)
        setName('')
        setPhone('')
        setRelation('Mother')
        setIsPrimary(false)
      } else {
        setErrorMessage(res.error || 'Failed to add contact')
      }
    }
  }

  const handleDelete = async (id: string, contactName: string) => {
    if (contacts.length <= 1) {
      if (!confirm(`Warning: SAKHI requires at least 1 emergency contact for automated SOS dispatch. Delete ${contactName}?`)) {
        return
      }
    }
    await deleteEmergencyContact(id)
    if (editingId === id) {
      handleCancelEdit()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        className="w-full max-w-lg bg-[#090d1a] border border-[#00d9d9]/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative my-auto text-left font-sans max-h-[90vh] flex flex-col"
      >
        {/* Top Close Button (allowed if at least 1 contact exists) */}
        {contacts.length > 0 && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#00d9d9]/20 border border-[#00d9d9]/50 flex items-center justify-center text-[#00d9d9]">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">Emergency Contacts Setup</h2>
            <p className="text-[11px] text-[#94a3b8] font-mono">
              Auto-dispatches GPS & Vitals to these guardians during distress
            </p>
          </div>
        </div>

        {/* Success / Error Banners */}
        {errorMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 font-mono">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Main Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 my-4 space-y-4">
          {/* 1. Add / Edit Contact Form */}
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-4">
            <b className="text-xs text-[#00d9d9] font-mono block mb-2.5 uppercase tracking-wider flex items-center gap-1.5">
              {editingId ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {editingId ? 'Edit Emergency Contact' : 'Add New Emergency Contact'}
            </b>

            <form onSubmit={handleSaveContact} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#94a3b8] mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mother, Sister Priya"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#090d1a] border border-white/10 focus:border-[#00d9d9] rounded-xl px-3 py-2 text-xs text-white placeholder-[#475569] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#94a3b8] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#090d1a] border border-white/10 focus:border-[#00d9d9] rounded-xl px-3 py-2 text-xs text-white placeholder-[#475569] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#94a3b8] mb-1">
                    Relationship
                  </label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="w-full bg-[#090d1a] border border-white/10 focus:border-[#00d9d9] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  >
                    {RELATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#090d1a] text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {!editingId && (
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      checked={isPrimary}
                      onChange={(e) => setIsPrimary(e.target.checked)}
                      className="rounded accent-[#00d9d9] w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="isPrimary" className="text-xs text-[#cbd5e1] cursor-pointer">
                      Set as Primary Guardian
                    </label>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#00d9d9] hover:bg-[#00f0f0] text-[#050914] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  {editingId ? 'Save Changes' : 'Add Contact'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-[#94a3b8] text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* 2. Active Contacts List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-[#94a3b8] uppercase tracking-wider">
                Configured Contacts ({contacts.length})
              </span>
              <span className="text-[10px] text-[#00d9d9] font-mono">1-Tap Delete or Edit</span>
            </div>

            {contacts.length === 0 ? (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center text-xs text-[#64748b] font-mono">
                No emergency contacts added yet. Please add at least 1 guardian above.
              </div>
            ) : (
              <div className="space-y-2">
                {contacts.map((c, idx) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-[#0f172a] border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 flex items-center justify-center font-bold text-xs text-[#00d9d9] shrink-0 font-mono">
                        {c.avatarInitials || 'EM'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <b className="text-xs text-white truncate">{c.name}</b>
                          {idx === 0 && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono border border-amber-500/30 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-300" /> Primary
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#94a3b8] font-mono flex items-center gap-2">
                          <span>{c.phone}</span>
                          <span>•</span>
                          <span className="text-cyan-400/90">{c.relation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(c)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-[#94a3b8] hover:text-[#00d9d9] transition-colors cursor-pointer"
                        title="Edit Contact"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={contacts.length === 0}
            className="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-emerald-400 text-[#050914] font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" /> Save Contacts & Continue to SAKHI
          </button>
        </div>
      </motion.div>
    </div>
  )
}
