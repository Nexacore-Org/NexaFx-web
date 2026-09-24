/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { Loader2, MessageSquare, ChevronRight, Send, CheckCircle } from 'lucide-react'
import {
  getDisputes,
  resolveDispute,
  addDisputeNote,
  type Dispute,
} from '@/lib/api/admin'

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [noteContent, setNoteContent] = useState('')
  const [resolution, setResolution] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadDisputes = async () => {
    try {
      setLoading(true)
      const data = await getDisputes()
      setDisputes(data)
      setError(null)
    } catch (err: any) {
      console.error('Failed to load disputes', err)
      setError(err?.message || 'Failed to load disputes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDisputes()
  }, [])

  const filteredDisputes = statusFilter === 'All'
    ? disputes
    : disputes.filter(d => d.status === statusFilter)

  const handleAddNote = async () => {
    if (!selectedDispute || !noteContent.trim()) return
    setSubmitting(true)
    try {
      const note = await addDisputeNote(selectedDispute.id, noteContent)
      setSelectedDispute({
        ...selectedDispute,
        notes: [...selectedDispute.notes, note],
      })
      setNoteContent('')
    } catch (err) {
      console.error('Failed to add note', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleResolve = async () => {
    if (!selectedDispute || !resolution.trim()) return
    setSubmitting(true)
    try {
      await resolveDispute(selectedDispute.id, resolution)
      setSelectedDispute({
        ...selectedDispute,
        status: 'Resolved',
        resolvedAt: new Date().toISOString(),
      })
      setDisputes(prev =>
        prev.map(d => d.id === selectedDispute.id ? { ...d, status: 'Resolved' as const } : d)
      )
      setResolution('')
    } catch (err) {
      console.error('Failed to resolve dispute', err)
    } finally {
      setSubmitting(false)
    }
  }

  const statusColors: Record<string, string> = {
    'Open': 'bg-red-100 text-red-700',
    'Under Review': 'bg-amber-100 text-amber-700',
    'Resolved': 'bg-green-100 text-green-700',
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-600">
        <p className="font-semibold">{error}</p>
        <button onClick={loadDisputes} className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Disputes</h1>
          <p className="text-sm text-gray-500 mt-1">Manage flagged transactions and disputes</p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'Open', 'Under Review', 'Resolved'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-[#FFD552] text-gray-900'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Disputes List */}
        <div className="space-y-3">
          {filteredDisputes.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-white rounded-2xl border border-gray-200">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No disputes found</p>
            </div>
          ) : (
            filteredDisputes.map(dispute => (
              <button
                key={dispute.id}
                onClick={() => setSelectedDispute(dispute)}
                className={`w-full text-left bg-white rounded-2xl border p-4 hover:border-yellow-300 transition-colors ${
                  selectedDispute?.id === dispute.id ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{dispute.userEmail}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{dispute.description}</p>
                    <p className="text-xs text-gray-400 mt-1">TX: {dispute.transactionId}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[dispute.status] || ''}`}>
                      {dispute.status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail Panel */}
        {selectedDispute && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Dispute Details</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedDispute.status] || ''}`}>
                  {selectedDispute.status}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium text-gray-900">User:</span> {selectedDispute.userEmail}</p>
                <p><span className="font-medium text-gray-900">Transaction:</span> {selectedDispute.transactionId}</p>
                <p><span className="font-medium text-gray-900">Created:</span> {new Date(selectedDispute.createdAt).toLocaleDateString()}</p>
                {selectedDispute.resolvedAt && (
                  <p><span className="font-medium text-gray-900">Resolved:</span> {new Date(selectedDispute.resolvedAt).toLocaleDateString()}</p>
                )}
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-700">
                {selectedDispute.description}
              </div>
            </div>

            {/* Conversation Thread */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Notes</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedDispute.notes.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No notes yet</p>
                ) : (
                  selectedDispute.notes.map(note => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">{note.adminEmail}</span>
                        <span className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add Note */}
            {selectedDispute.status !== 'Resolved' && (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteContent}
                    onChange={e => setNoteContent(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    onKeyDown={e => { if (e.key === 'Enter') handleAddNote() }}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!noteContent.trim() || submitting}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Resolve */}
            {selectedDispute.status !== 'Resolved' && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Resolve Dispute</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={resolution}
                    onChange={e => setResolution(e.target.value)}
                    placeholder="Resolution summary..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    onKeyDown={e => { if (e.key === 'Enter') handleResolve() }}
                  />
                  <button
                    onClick={handleResolve}
                    disabled={!resolution.trim() || submitting}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle size={16} />
                    Resolve
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
