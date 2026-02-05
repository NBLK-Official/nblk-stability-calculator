import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Button,
  Container,
  Link,
  IconButton,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import { motion, AnimatePresence, color } from 'framer-motion';
import { Results, RegionAverage, AgeRangeAverage } from '../types';
import {
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  Replay as ReplayIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Footer from '../components/Footer';

const getScoreColor = (score: number) => {
  if (score <= 20) return '#F44336'; 
  if (score <= 40) return '#FF9800'; 
  if (score <= 60) return '#FFC107'; 
  if (score <= 80) return '#8BC34A';
  return '#4CAF50'; 
};

const getStabilityIcon = (score: number) => {
  if (score <= 20) return '💥'; 
  if (score <= 40) return '🔥'; 
  if (score <= 60) return '🌪️'; 
  if (score <= 80) return '🌳'; 
  return '🌱'; 
};

const getStabilityText = (score: number) => {
  if (score <= 20) return 'Very Unstable';
  if (score <= 40) return 'Low Stability';
  if (score <= 60) return 'Moderately Stable';
  if (score <= 80) return 'Highly Stable';
  return 'Extremely Stable';
};

const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const FOREST_GREEN = '#228B22';
const BAR_BG = '#e0e0e0';
const BAR_HEIGHT = 22;
const BAR_WIDTH = 180;

interface BarChartProps {
  label: string;
  value: number;
  max: number;
  highlight?: boolean;
  color?: string;
}

const AnimatedBar = ({ label, value, max, highlight, color }: BarChartProps) => {
  const width = `${Math.min(100, Math.round((value / max) * 100))}%`;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: '100%' }}>
      <Box sx={{width: { xs: '30%', sm: 140 },minWidth: 80, maxWidth: 140, color: '#8B6F00', fontWeight: 500, fontSize: { xs: 14, sm: 16 }, textAlign: 'right', pr: 1 }}>
        {label}
      </Box>
      <Box
        sx={{
          height: BAR_HEIGHT,
          width: { xs: 120, sm: BAR_WIDTH },
          bgcolor: BAR_BG,
          borderRadius: 2,
          mx: 1,
          position: 'relative',
          flex: 1,
          minWidth: 80,
          maxWidth: BAR_WIDTH,
          boxShadow: highlight ? `0 0 0 2px #228B22, 0 0 8px 2px #228B2244` : undefined,
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: width,
            bgcolor: color || FOREST_GREEN,
            borderRadius: 2,
            transition: 'width 1.2s cubic-bezier(.4,2,.3,1)',
            boxShadow: highlight ? '0 0 8px 2px #228B2288' : undefined,
          }}
        />
      </Box>
      <Box sx={{ minWidth: 32, color: '#8B6F00', fontWeight: 600, fontSize: { xs: 14, sm: 16 } }}>
        {value}
      </Box>
    </Box>
  );
};

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state as Results;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!results) {
    navigate('/');
    return null;
  }

  const handleShare = (platform: string) => {
    const message = `My Political Stability Score: ${results.compositeScore.toFixed(1)} - ${getStabilityText(results.compositeScore)}`;
    const url = window.location.href;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
    }
  };

  const getScoreInterpretation = (score: number) => {
    if (score <= 20) return 'Stable environment with minimal risks.';
    if (score <= 40) return 'Some risks present, but manageable.';
    if (score <= 60) return 'Noticeable risks that require attention.';
    if (score <= 80) return 'Significant risks with potential for major shifts.';
    return 'Critical risks that could lead to severe consequences.';
  };

  const score = results.compositeScore;
  const grade = results.grade || 'N/A';
  const stabilityStatus = results.stabilityStatus || getStabilityText(score);
  const avgScore = results.communityAverages?.overall ? Math.round(results.communityAverages.overall) : 0;
  const maxScore = Math.max(score, avgScore, 100);
  const byRegion = results.communityAverages?.by_region || [];
  const byAgeRange = results.communityAverages?.by_age_range || [];

  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        type: 'analysis_request',
        name: form.firstName,
        email: form.email,
        survey_id: results?.surveyId || null,
        composite_score: results?.compositeScore,
        stability_status: results?.stabilityStatus,
      };

      const response = await fetch(
        'https://prod-29.eastus.logic.azure.com:443/workflows/d7676124cd8a4ef684c2f9761f30c8b8/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=3rnFNN5uf-NjE4uDhUUvtggdFWrNrdPMWVh8EielA2w',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      setSuccessMessage('Thank you! Your request has been submitted.\nWe will reach out to you with your full analysis shortly.');
      setTimeout(() => {
        setOpenDialog(false);
        setSuccessMessage(null);
        setForm({ firstName: '', lastName: '', email: '' });
      }, 5000);
    } catch (err: any) {
      console.error('Error submitting analysis request:', err);
      setError('Failed to submit your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogOpen = () => setOpenDialog(true);
  const handleDialogClose = () => setOpenDialog(false);
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, overflow: 'hidden', marginTop: -3 }}>
      <Box
        sx={{
          minHeight: '150vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: 2,
          withwidth: '100%',
          overflow: 'hidden',
          margin: '0 auto',          
        }}
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 4,
                textAlign: 'center',
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              <Typography variant="h4" component="h1" gutterBottom align="center">
                Political Stability Score
              </Typography>

              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {getStabilityIcon(score)} {stabilityStatus}
              </Typography>

              {/* Bar Comparison Section */}
              <Box sx={{ my: 2, width: '100%', maxWidth: 400, mx: 'auto' }}>
                <AnimatedBar label="Your Score:" value={Math.round(score)} max={maxScore} highlight color={getScoreColor(score)} />
                <AnimatedBar label="Average Score:" value={avgScore} max={maxScore} color={getScoreColor(avgScore)} />
              </Box>
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                Average Score of all Respondents: {results.communityAverages?.overall?.toFixed(1) || 'N/A'}
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                You rated the administration as <strong>{stabilityStatus}</strong>.
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                Most users rated the administration as {getStabilityText(avgScore)}.
              </Typography>

              {/* Regional Comparison */}
              {byRegion.length > 0 && (
                <Box sx={{ mt: 4, mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
                    Average Scores by Region
                  </Typography>
                  <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
                    {byRegion.map((item: RegionAverage) => (
                      <AnimatedBar 
                        key={item.region} 
                        label={item.region} 
                        value={Math.round(item.avg_composite_score)} 
                        max={100} 
                        color={getScoreColor(item.avg_composite_score)} 
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Age Range Comparison */}
              {byAgeRange.length > 0 && (
                <Box sx={{ mt: 4, mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
                    Average Scores by Age Group
                  </Typography>
                  <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
                    {byAgeRange.map((item: AgeRangeAverage) => (
                      <AnimatedBar 
                        key={item.age_range} 
                        label={item.age_range} 
                        value={Math.round(item.avg_composite_score)} 
                        max={100} 
                        color={getScoreColor(item.avg_composite_score)} 
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Instability Score Interpretation Table (Legend)
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
                  Instability Score Interpretation Table
                </Typography>
              <Box sx={{ mt: 3, mb: 4, display: 'flex', justifyContent: 'center' }}>
                {(() => {
                  let range = '';
                  let level = '';
                  let description = '';
                  if (score <= 20) {
                    range = '0 – 20';
                    level = 'Very Low Instability';
                    description = 'People experience predictability, trust in systems, and confidence in leadership.';
                  } else if (score <= 40) {
                    range = '21 – 40';
                    level = 'Low Instability';
                    description = 'Most services run smoothly; occasional public concerns but little daily impact.';
                  } else if (score <= 60) {
                    range = '41 – 60';
                    level = 'Moderate Instability';
                    description = 'Public may feel divided or uneasy; pressure builds in specific communities or sectors.';
                  } else if (score <= 80) {
                    range = '61 – 80';
                    level = 'High Instability';
                    description = 'People may feel anxious, polarized, or distrustful; protests or policy backlash likely.';
                  } else {
                    range = '81 – 100';
                    level = 'Extreme Instability';
                    description = 'Society may face unrest, fear, rapid change, or crisis-level tension and division.';
                  }
                  return (
                    <Paper elevation={2} sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 0.5,
                      gap: 3,
                      minWidth: 260,
                      background: '#faf9f6',
                      borderRadius: 2,
                      boxShadow: 0.5,
                      width: '100%',
                      maxWidth: 700,
                    }}>
                      <Box sx={{ flex: 1, minWidth: 90, textAlign: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', marginTop: -1.5 }}>Score Range</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, marginTop: 3.0 }}>{range}</Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 110, textAlign: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', marginTop: 0.5 }}>Instability Level</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 , marginTop: 1 }}>{level}</Typography>
                      </Box>
                      <Box sx={{ flex: 2, minWidth: 160, textAlign: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', marginTop: 0.5 }}>Impact Description</Typography>
                        <Typography variant="body2" sx={{ marginTop: 1.5 }}>{description}</Typography>
                      </Box>
                    </Paper>
                  );
                })()}
              </Box> */}
              {/* Instability Score Interpretation Table (Legend) */}
              <Box sx={{ mt: 3, mb: 4, overflowX: 'auto' }}>
                 <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
                   Stability Score Interpretation Table
                 </Typography>
                 <Box component="table" sx={{
                   width: '100%',
                   borderCollapse: 'collapse',
                   fontSize: '0.85rem',
                   background: '#faf9f6',
                   borderRadius: 2,
                   boxShadow: 2,
                   minWidth: 340,
                   '@media (max-width: 600px)': {
                     fontSize: '0.78rem',
                   },
                 }}>
                   <Box component="thead" sx={{ background: '#f5f5f5' }}>
                     <Box component="tr">
                       <Box component="th" sx={{ p: 0.5, fontWeight: 700, borderBottom: '1.5px solid #ccc', textAlign: 'center', minWidth: 60 }}>Score Range</Box>
                       <Box component="th" sx={{ p: 0.5, fontWeight: 700, borderBottom: '1.5px solid #ccc', textAlign: 'center', minWidth: 90 }}>Stability Level</Box>
                       <Box component="th" sx={{ p: 0.5, fontWeight: 700, borderBottom: '1.5px solid #ccc', textAlign: 'center', minWidth: 120 }}>What It Means for Society</Box>
                     </Box>
                   </Box>
                   <Box component="tbody">
                     <Box component="tr">
                       <Box component="td" sx={{ p: 0.5, borderBottom: '1px solid #eee' }}>81 – 100</Box>
                       <Box component="td" sx={{ p: 0.5, textAlign: 'left', borderBottom: '1px solid #eee' }}>🟢 Extremely Stable</Box>
                       <Box component="td" sx={{ p: 0.5, borderBottom: '1px solid #eee' }}>The administration appears very steady, with strong leadership and minimal disruption. People feel confident, calm, and trust that systems are working well.</Box>
                     </Box>
                     <Box component="tr">
                       <Box component="td" sx={{ p: 0.5, borderBottom: '1px solid #eee' }}>61 – 80</Box>
                       <Box component="td" sx={{ p: 0.5, textAlign: 'left', borderBottom: '1px solid #eee' }}>🟢 Highly Stable</Box>
                       <Box component="td" sx={{ p: 0.5, borderBottom: '1px solid #eee' }}>The administration is mostly consistent, with few major problems or risks. Most people feel secure, and daily life runs smoothly.</Box>
                     </Box>
                     <Box component="tr">
                       <Box component="td" sx={{ p: 0.5, borderBottom: '1px solid #eee' }}>41 – 60</Box>
                       <Box component="td" sx={{ p: 0.5, textAlign: 'left', borderBottom: '1px solid #eee' }}>🟡 Moderately Stable</Box>
                       <Box component="td" sx={{ p: 0.5, borderBottom: '1px solid #eee' }}>The administration shows some inconsistency or uneven decision-making. People may feel mixed some tension, but no major breakdowns.</Box>
                     </Box>
                     <Box component="tr">
                       <Box component="td" sx={{ p: 0.5, borderBottom: '1px solid #eee' }}>21 – 40</Box>
                       <Box component="td" sx={{ p: 0.5, textAlign: 'left', borderBottom: '1px solid #eee' }}>🟠 Low Stability</Box>
                       <Box component="td" sx={{ p: 0.5, borderBottom: '1px solid #eee' }}>The administration is facing leadership or policy struggles across key areas. People may feel divided, concerned, or affected by political shifts.</Box>
                     </Box>
                     <Box component="tr">
                       <Box component="td" sx={{ p: 0.5, borderBottom: '1px solid #eee' }}>0 – 20</Box>
                       <Box component="td" sx={{ p: 0.5, textAlign: 'left', borderBottom: '1px solid #eee' }}>🔴 Very Unstable</Box>
                       <Box component="td" sx={{ p: 0.5, borderBottom: '1px solid #eee' }}>The administration is seen as highly unpredictable or dysfunctional. People may feel unsafe, angry, or unsure about the future.</Box>
                     </Box>
                   </Box>
                 </Box>
               </Box>
              <Box sx={{ mb: 4 }}>
                  <Button variant="text" sx={{ p: 0, minWidth: 0, textTransform: 'none' }} onClick={handleDialogOpen}>
                    <span style={{ color: theme.palette.primary.main, textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem' }}>
                      Want a full analysis of your results? Click here to request one.
                    </span>
                  </Button>
                  <Dialog open={openDialog} onClose={handleDialogClose}>
                    <DialogTitle>Request Full Analysis</DialogTitle>
                    <form onSubmit={handleFormSubmit}>
                      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
                        {successMessage ? (
                          <Typography color="success.main" sx={{ textAlign: 'center', py: 2, whiteSpace: 'pre-line' }}>
                            {successMessage}
                          </Typography>
                        ) : (
                          <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Request a comprehensive analysis of your stability score. Our team will review your results and reach out to you with:
                            </Typography>
                            <ul style={{ marginTop: 0, marginBottom: 16, paddingLeft: 36, color: theme.palette.text.secondary }}>
                              <li>In-depth breakdown of your score</li>
                              <li>Detailed insights on political stability trends</li>
                              <li>Personalized analysis based on your responses</li>
                            </ul>
                            <TextField
                              label="Your Name"
                              name="firstName"
                              value={form.firstName}
                              onChange={handleFormChange}
                              required
                              fullWidth
                              disabled={isLoading}
                            />
                            <TextField
                              label="Email Address"
                              name="email"
                              type="email"
                              value={form.email}
                              onChange={handleFormChange}
                              required
                              fullWidth
                              helperText="We'll reach out to you at this email"
                              disabled={isLoading}
                            />
                            {error && (
                              <Typography color="error" variant="body2">
                                {error}
                              </Typography>
                            )}
                          </>
                        )}
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleDialogClose} disabled={isLoading}>
                          Cancel
                        </Button>
                        {!successMessage && (
                          <Button 
                            type="submit" 
                            variant="contained"
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Submitting...' : 'Request Analysis'}
                          </Button>
                        )}
                      </DialogActions>
                    </form>
                  </Dialog>
                </Box>


              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ReplayIcon />}
                  onClick={() => navigate('/evaluate')}
                  sx={{ px: 4, py: 1 }}
                >
                  Take Again
                </Button>
              </Box>

            </Paper>
            <Footer />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Container>
  );
};

export default ResultsPage; 
