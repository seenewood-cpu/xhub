'use client';

import { useState } from 'react';
import ContentPage from '@/components/ContentPage';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => setStatus('sent'), 1000);
  }

  return (
    <ContentPage title="Contact Us" lastUpdated="July 31, 2026">
      <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed">
        <p>We&apos;d love to hear from you. Whether you have a question, feedback, or need support, feel free to reach out.</p>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Send us a message</h2>
          {status === 'sent' ? (
            <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
              <svg className="w-12 h-12 text-green-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-400 font-medium">Message sent! We&apos;ll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="label">Name</label>
                  <input id="contact-name" type="text" required value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="contact-email" className="label">Email</label>
                  <input id="contact-email" type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field" placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label htmlFor="contact-subject" className="label">Subject</label>
                <select id="contact-subject" value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-field" required>
                  <option value="">Select a topic</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="content">Content Removal Request</option>
                  <option value="copyright">Copyright / DMCA</option>
                  <option value="advertising">Advertising</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="contact-message" className="label">Message</label>
                <textarea id="contact-message" required value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input-field min-h-[140px]" rows={5}
                  placeholder="How can we help?" />
              </div>
              <button type="submit" className="btn-primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-10 pt-8 border-t border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Other ways to reach us</h2>
          <div className="space-y-3">
            <p className="flex items-center gap-3">
              <svg className="w-5 h-5 text-indigo flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>For general inquiries: <span className="text-[var(--text-primary)]">support@vhub.example.com</span></span>
            </p>
            <p className="flex items-center gap-3">
              <svg className="w-5 h-5 text-indigo flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>For copyright issues: <span className="text-[var(--text-primary)]">dmca@vhub.example.com</span></span>
            </p>
          </div>
        </div>
      </div>
    </ContentPage>
  );
}
