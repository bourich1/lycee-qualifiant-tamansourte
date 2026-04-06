import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

type FormData = {
  full_name: string;
  phone: string;
  instagram_link: string;
  technical_skill: string;
  gender: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const SKILLS = ['Cybersecurity', 'Data Analytics', 'Frontend', 'Backend', 'Fullstack'];
const GENDERS = ['Male', 'Female'];

const INITIAL_FORM: FormData = {
  full_name: '',
  phone: '',
  instagram_link: '',
  technical_skill: '',
  gender: '',
};

export default function CyberTeamJoin() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted, navigate]);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[\+]?[0-9\s\-\(\)]{7,15}$/.test(form.phone.trim())) {
      errs.phone = 'Please enter a valid phone number';
    }
    if (!form.instagram_link.trim()) {
      errs.instagram_link = 'Instagram profile link is required';
    } else {
      try {
        const url = new URL(form.instagram_link.trim());
        if (!url.hostname.includes('instagram.com')) {
          errs.instagram_link = 'Please enter a valid Instagram URL';
        }
      } catch {
        errs.instagram_link = 'Please enter a valid Instagram URL';
      }
    }
    if (!form.technical_skill) errs.technical_skill = 'Please select a technical skill';
    if (!form.gender) errs.gender = 'Please select your gender';
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setApiError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('security_team_applicants')
        .insert([{
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          instagram_link: form.instagram_link.trim(),
          technical_skill: form.technical_skill,
          gender: form.gender,
        }])
        .select();

      if (error) {
        const status = error.code;
        if (status === '42501' || error.message?.includes('denied')) {
          setApiError('Unauthorized. Please log in.');
        } else if (status === '23505') {
          setApiError('A conflict occurred. Please try again.');
        } else if (error.message?.includes('violates')) {
          setApiError('Invalid data. Please check your inputs.');
        } else {
          setApiError('Server error. Please try again later.');
        }
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setApiError('Server error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.asciiArt}>
{`
 ██████╗██╗   ██╗██████╗ ███████╗██████╗ 
██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗
██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝
██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗
╚██████╗   ██║   ██████╔╝███████╗██║  ██║
 ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝
`}
            </div>
            <h1 style={styles.title}>SECURITY TEAM</h1>
          </div>
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✓</div>
            <p style={styles.successText}>Thank you for contacting us.</p>
            <p style={styles.successSubtext}>&gt; Application submitted. Redirecting to home...</p>
            <div style={styles.blinkingCursor}>█</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.asciiArt}>
{`
 ██████╗██╗   ██╗██████╗ ███████╗██████╗ 
██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗
██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝
██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗
╚██████╗   ██║   ██████╔╝███████╗██║  ██║
 ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝
`}
          </div>
          <h1 style={styles.title}>SECURITY TEAM APPLICATION</h1>
          <p style={styles.subtitle}>&gt; Join the elite cyber security division</p>
          <div style={styles.divider} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Full Name */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="cyber-full-name">&gt;_ Full Name</label>
            <input
              id="cyber-full-name"
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              style={styles.input}
              onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={e => { e.target.style.borderColor = '#1a3a1a'; e.target.style.boxShadow = 'none'; }}
            />
            {errors.full_name && <span style={styles.error}>! {errors.full_name}</span>}
          </div>

          {/* Phone */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="cyber-phone">&gt;_ Phone</label>
            <input
              id="cyber-phone"
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              placeholder="+212 600 000 000"
              style={styles.input}
              onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={e => { e.target.style.borderColor = '#1a3a1a'; e.target.style.boxShadow = 'none'; }}
            />
            {errors.phone && <span style={styles.error}>! {errors.phone}</span>}
          </div>



          {/* Instagram Profile Link */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="cyber-instagram-link">&gt;_ Instagram Profile Link</label>
            <input
              id="cyber-instagram-link"
              name="instagram_link"
              type="url"
              value={form.instagram_link}
              onChange={handleChange}
              placeholder="https://instagram.com/yourprofile"
              style={styles.input}
              onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={e => { e.target.style.borderColor = '#1a3a1a'; e.target.style.boxShadow = 'none'; }}
            />
            {errors.instagram_link && <span style={styles.error}>! {errors.instagram_link}</span>}
          </div>

          {/* Technical Skill */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="cyber-skill">&gt;_ Technical Skill</label>
            <select
              id="cyber-skill"
              name="technical_skill"
              value={form.technical_skill}
              onChange={handleChange}
              style={styles.select}
              onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={e => { e.target.style.borderColor = '#1a3a1a'; e.target.style.boxShadow = 'none'; }}
            >
              <option value="" disabled>-- Select Skill --</option>
              {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.technical_skill && <span style={styles.error}>! {errors.technical_skill}</span>}
          </div>

          {/* Gender */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="cyber-gender">&gt;_ Gender</label>
            <select
              id="cyber-gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              style={styles.select}
              onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={e => { e.target.style.borderColor = '#1a3a1a'; e.target.style.boxShadow = 'none'; }}
            >
              <option value="" disabled>-- Select Gender --</option>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            {errors.gender && <span style={styles.error}>! {errors.gender}</span>}
          </div>

          {/* API Error */}
          {apiError && (
            <div style={styles.apiError}>
              <span style={styles.errorPrefix}>[ERROR]</span> {apiError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.submitBtn,
              ...(isSubmitting ? styles.submitBtnDisabled : {}),
            }}
            onMouseEnter={e => {
              if (!isSubmitting) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#00ff00';
                (e.target as HTMLButtonElement).style.color = '#0a0a0a';
                (e.target as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(0,255,0,0.4)';
              }
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
              (e.target as HTMLButtonElement).style.color = '#00ff00';
              (e.target as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            {isSubmitting ? (
              <span style={styles.spinner}>
                <span style={styles.spinnerDot}>⠋</span> PROCESSING...
              </span>
            ) : (
              '[ SUBMIT APPLICATION ]'
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <p>&gt; Lycée Qualifiant Tamansourte — Cyber Security Division</p>
          <p>&gt; All data is encrypted and secure_</p>
        </div>
      </div>

      {/* Animated scanline overlay */}
      <div style={styles.scanlines} />

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes spinChars {
          0% { content: "⠋"; }
          12% { content: "⠙"; }
          25% { content: "⠹"; }
          37% { content: "⠸"; }
          50% { content: "⠼"; }
          62% { content: "⠴"; }
          75% { content: "⠦"; }
          87% { content: "⠧"; }
          100% { content: "⠇"; }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#00ff00',
    fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", "Consolas", monospace',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '2rem 1rem',
    position: 'relative',
    overflow: 'hidden',
  },
  container: {
    width: '100%',
    maxWidth: '640px',
    position: 'relative',
    zIndex: 2,
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  asciiArt: {
    fontSize: '0.45rem',
    lineHeight: 1.2,
    whiteSpace: 'pre' as const,
    color: '#00ff00',
    opacity: 0.8,
    marginBottom: '0.5rem',
    overflow: 'hidden',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    letterSpacing: '0.2em',
    color: '#00ff00',
    textShadow: '0 0 10px rgba(0,255,0,0.5)',
    margin: '0.5rem 0',
  },
  subtitle: {
    fontSize: '0.875rem',
    opacity: 0.7,
    margin: '0.25rem 0',
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, #00ff00, transparent)',
    margin: '1.5rem 0',
    opacity: 0.3,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.375rem',
  },
  label: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
    color: '#00ff00',
  },
  optional: {
    opacity: 0.5,
    fontWeight: 400,
    fontSize: '0.75rem',
  },
  input: {
    backgroundColor: '#0d0d0d',
    border: '1px solid #1a3a1a',
    borderRadius: '4px',
    padding: '0.75rem 1rem',
    color: '#00ff00',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputFocus: {
    borderColor: '#00ff00',
    boxShadow: '0 0 8px rgba(0,255,0,0.3)',
  },
  select: {
    backgroundColor: '#0d0d0d',
    border: '1px solid #1a3a1a',
    borderRadius: '4px',
    padding: '0.75rem 1rem',
    color: '#00ff00',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none' as const,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%2300ff00\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 11L3 6h10z\'/%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  error: {
    color: '#ff4444',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  apiError: {
    backgroundColor: 'rgba(255,0,0,0.08)',
    border: '1px solid rgba(255,0,0,0.3)',
    borderRadius: '4px',
    padding: '0.75rem 1rem',
    color: '#ff4444',
    fontSize: '0.8125rem',
  },
  errorPrefix: {
    fontWeight: 700,
    marginRight: '0.5rem',
  },
  submitBtn: {
    marginTop: '0.5rem',
    padding: '0.875rem 2rem',
    backgroundColor: 'transparent',
    color: '#00ff00',
    border: '2px solid #00ff00',
    borderRadius: '4px',
    fontFamily: 'inherit',
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase' as const,
  },
  submitBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  spinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  spinnerDot: {
    display: 'inline-block',
    animation: 'spinChars 0.8s steps(8) infinite',
  },
  footer: {
    marginTop: '2.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(0,255,0,0.15)',
    textAlign: 'center' as const,
    fontSize: '0.75rem',
    opacity: 0.4,
    lineHeight: 1.8,
  },
  successBox: {
    textAlign: 'center' as const,
    padding: '3rem 2rem',
    border: '1px solid #1a3a1a',
    borderRadius: '4px',
    backgroundColor: 'rgba(0,255,0,0.03)',
  },
  successIcon: {
    fontSize: '3rem',
    color: '#00ff00',
    textShadow: '0 0 20px rgba(0,255,0,0.6)',
    marginBottom: '1.5rem',
  },
  successText: {
    fontSize: '1.125rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  successSubtext: {
    fontSize: '0.875rem',
    opacity: 0.6,
    marginBottom: '1.5rem',
  },
  blinkingCursor: {
    fontSize: '1.25rem',
    animation: 'blink 1s step-end infinite',
    color: '#00ff00',
  },
  scanlines: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none' as const,
    background: 'repeating-linear-gradient(0deg, rgba(0,255,0,0.015) 0px, rgba(0,255,0,0.015) 1px, transparent 1px, transparent 3px)',
    zIndex: 1,
  },
};
