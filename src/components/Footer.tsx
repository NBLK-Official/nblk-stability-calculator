import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const [openFeedback, setOpenFeedback] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    preferred_name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFeedbackOpen = () => {
    setOpenFeedback(true);
    setSubmitStatus('idle');
  };

  const handleFeedbackClose = () => {
    setOpenFeedback(false);
    setFeedbackForm({ preferred_name: '', email: '', message: '' });
    setSubmitStatus('idle');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFeedbackForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackForm.message.trim()) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with your actual feedback endpoint
      const response = await fetch(
        'https://prod-29.eastus.logic.azure.com:443/workflows/d7676124cd8a4ef684c2f9761f30c8b8/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=3rnFNN5uf-NjE4uDhUUvtggdFWrNrdPMWVh8EielA2w',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'feedback',
            preferred_name: feedbackForm.preferred_name || null,
            email: feedbackForm.email || null,
            message: feedbackForm.message,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to submit');
      
      setSubmitStatus('success');
      setFeedbackForm({ preferred_name: '', email: '', message: '' });
    } catch (err) {
      console.error('Feedback submission failed:', err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Box sx={{ textAlign: 'center', mt: 4, py: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Have ideas for other indicators?{' '}
          <Link
            onClick={handleFeedbackOpen}
            sx={{ cursor: 'pointer'}}
            color="primary"
          >
            Click here to share your feedback
          </Link>
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Link
            onClick={() => navigate('/about')}
            sx={{ cursor: 'pointer', color: 'primary.main', textDecoration: 'underline' }}
          >
            About
          </Link>
          <Link
            onClick={() => navigate('/privacy')}
            sx={{ cursor: 'pointer', color: 'primary.main', textDecoration: 'underline' }}
          >
            Privacy Policy
          </Link>
        </Box>

        <Typography variant="body2" color="text.secondary">
          © 2026 Stability Calculator | Product of NBLK 
        </Typography>
      </Box>

      {/* Feedback Dialog */}
      <Dialog open={openFeedback} onClose={handleFeedbackClose} maxWidth="sm" fullWidth>
        <DialogTitle>Share Your Feedback</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {submitStatus === 'success' ? (
            <Alert severity="success">
              Thank you for your feedback! We appreciate your input.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                Have ideas for new indicators or suggestions for improvement? We'd love to hear from you!
              </Typography>
              <TextField
                label="Preferred Name (optional)"
                name="preferred_name"
                value={feedbackForm.preferred_name}
                onChange={handleInputChange}
                fullWidth
                disabled={isSubmitting}
              />
              <TextField
                label="Email (optional)"
                name="email"
                type="email"
                value={feedbackForm.email}
                onChange={handleInputChange}
                fullWidth
                disabled={isSubmitting}
                helperText="If you'd like us to follow up with you"
              />
              <TextField
                label="Your Feedback"
                name="message"
                value={feedbackForm.message}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                required
                disabled={isSubmitting}
                placeholder="Share your ideas, suggestions or any feedback"
              />
              {submitStatus === 'error' && (
                <Alert severity="error">
                  Failed to submit feedback. Please try again!
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleFeedbackClose} disabled={isSubmitting}>
            {submitStatus === 'success' ? 'Close' : 'Cancel'}
          </Button>
          {submitStatus !== 'success' && (
            <Button
              onClick={handleFeedbackSubmit}
              variant="contained"
              disabled={isSubmitting || !feedbackForm.message.trim()}
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Footer; 