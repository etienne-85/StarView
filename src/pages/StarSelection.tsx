import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Star as StarIcon, MapPin, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { useStarsForEmotion } from '../hooks/useStarsCatalog';
import { useStarviewCamera } from '../hooks/useStarviewCamera';
import { emotions } from '../data/emotions';
import { HygStarData, SuggestedStar } from '../types';
import { STAR_SETTINGS } from '../config/starConfig';

/**
 * StarSelection Component - Updated to Receive Props from App
 * 
 * Purpose: Emotion-based star selection interface that receives suggested stars
 * and loading state as props from the App component.
 * 
 * UPDATED: No longer directly manages star suggestion fetching - receives data via props
 * 
 * Features:
 * - Receives suggestedStars and isLoadingSuggestions as props
 * - Displays loading state from parent
 * - Renders suggested stars in sidebar
 * - Maintains camera focus control for user interactions
 * - Star detail modal using selectedStar from parent
 * - FIXED: Sidebar selection visual state using framer-motion animate prop
 * 
 * Confidence Rating: High - Clean props-based architecture with fixed selection state
 */

interface StarSelectionProps {
  selectedStar: HygStarData | null;
  setSelectedStar: (star: HygStarData | null) => void;
  onStarClick: (star: HygStarData) => void;
  suggestedStars: SuggestedStar[];
  isLoadingSuggestions: boolean;
}

export function StarSelection({ 
  selectedStar, 
  setSelectedStar, 
  onStarClick, 
  suggestedStars, 
  isLoadingSuggestions 
}: StarSelectionProps) {
  const { emotionId } = useParams<{ emotionId: string }>();
  const navigate = useNavigate();
  const { stars: catalogStars, loading: catalogLoading, error: catalogError } = useStarsForEmotion(emotionId, 5);
  const { focusOnStar, centerView } = useStarviewCamera();
  
  const emotion = emotions.find(e => e.id === emotionId);

  console.log('StarSelection: Rendered with props:', {
    emotionId,
    suggestedStarsCount: suggestedStars.length,
    isLoadingSuggestions,
    catalogStarsCount: catalogStars.length,
    catalogLoading
  });

  // Log suggested star names for debugging
  if (suggestedStars.length > 0) {
    console.log('StarSelection: Received suggested star names:', 
      suggestedStars.map(s => s.name || 'Unnamed').join(', '));
  }

  // Center view when suggested stars are available (only once per emotion)
  const centeredForEmotionRef = useRef<string | null>(null);
  useEffect(() => {
    if (suggestedStars.length > 0 && emotionId && centeredForEmotionRef.current !== emotionId) {
      console.log(`StarSelection: Centering view for emotion ${emotionId} with ${suggestedStars.length} suggested stars`);
      centerView();
      centeredForEmotionRef.current = emotionId;
    }
  }, [suggestedStars.length, emotionId, centerView]);

  // Reset centered emotion when emotion changes
  useEffect(() => {
    if (emotionId && centeredForEmotionRef.current && centeredForEmotionRef.current !== emotionId) {
      centeredForEmotionRef.current = null;
    }
  }, [emotionId]);

  if (!emotion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cosmic-observation text-xl">Emotion not found</p>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/');
  };

  const handleStarSelect = (catalogStar: HygStarData, index: number) => {
    console.log('StarSelection: Star selected for modal display:', catalogStar.hyg.proper || catalogStar.hyg.id);
    
    setSelectedStar(catalogStar);
    
    const catalogId = catalogStar.hyg.id.toString();
    focusOnStar(catalogId);
  };

  const handleCloseModal = () => {
    console.log('StarSelection: Closing modal by clearing selectedStar');
    setSelectedStar(null);
  };

  const handleDedicate = (catalogStar: HygStarData) => {
    navigate(`/dedicate/catalog-${catalogStar.hyg.id}?emotion=${emotionId}`);
  };

  // Show loading state if either catalog or suggestions are loading
  const isLoading = catalogLoading || isLoadingSuggestions;

  if (isLoading) {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative z-10 flex items-center justify-center min-h-screen pointer-events-auto">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 border-2 border-cosmic-cherenkov-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cosmic-observation text-lg font-light">
              {isLoadingSuggestions ? 'Loading suggested stars...' : 'Scanning the cosmic depths...'}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (catalogError) {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative z-10 flex items-center justify-center min-h-screen pointer-events-auto">
          <div className="text-center">
            <p className="text-red-400 text-xl mb-4">Unable to access star catalog</p>
            <p className="text-cosmic-stellar-wind text-sm mb-4">{catalogError}</p>
            <button 
              onClick={handleBack}
              className="text-cosmic-cherenkov-blue hover:text-cosmic-plasma-glow transition-colors font-light"
            >
              ← Return to emotion selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Determine which stars to display in sidebar
  const starsToDisplay = suggestedStars.length > 0 
    ? suggestedStars.map(suggested => suggested.starCatalogRef)
    : catalogStars;

  const displaySource = suggestedStars.length > 0 ? 'AI Suggested' : 'Catalog';

  console.log(`StarSelection: Displaying ${starsToDisplay.length} stars from ${displaySource}`);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Page Title - Centered at Top */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
        <motion.h1 
          className="text-3xl font-light text-cosmic-observation text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Pick your star
        </motion.h1>
      </div>

      {/* Back Button and Color Indicators - Left Side */}
      <div className="absolute top-6 left-6 z-20 pointer-events-auto space-y-4">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-cosmic-stellar-wind hover:text-cosmic-observation transition-colors group font-light frosted-glass px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Return to emotions
        </button>

        {/* STAR_SETTINGS Color Indicators */}
        <motion.div
          className="frosted-glass px-4 py-3 rounded-lg space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-cosmic-stellar-wind text-xs font-light opacity-80 mb-3">
            Star colors in 3D view:
          </p>
          
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 relative">
              <div 
                className="star-icon-tint"
                style={{
                  backgroundColor: STAR_SETTINGS.highlighted.color
                }}
              />
            </div>
            <span className="text-cosmic-light-echo text-xs font-light">Highlighted stars</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 relative">
              <div 
                className="star-icon-tint"
                style={{
                  backgroundColor: STAR_SETTINGS.selected.color
                }}
              />
            </div>
            <span className="text-cosmic-light-echo text-xs font-light">Selected star</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 relative">
              <div 
                className="star-icon-tint"
                style={{
                  backgroundColor: STAR_SETTINGS.regular.color
                }}
              />
            </div>
            <span className="text-cosmic-light-echo text-xs font-light">Other stars</span>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Right Sidebar */}
      <div className="fixed right-0 top-0 h-full w-80 z-30 pointer-events-auto">
        <div 
          className="h-full border-l"
          style={{
            background: 'rgba(248, 250, 252, 0.02)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(248, 250, 252, 0.06)',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Header */}
            <div className="mb-6">
              <motion.div
                className="flex items-center gap-3 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: `rgba(127, 255, 148, 0.15)`,
                    border: `1px solid rgba(127, 255, 148, 0.3)`
                  }}
                >
                  <Sparkles className="w-4 h-4 text-cosmic-observation" />
                </div>
                <div>
                  <h3 className="text-lg font-light text-cosmic-observation">
                    {emotion.name} Stars
                  </h3>
                  <p className="text-cosmic-stellar-wind text-xs font-light opacity-70">
                    {starsToDisplay.length} celestial beacons ({displaySource})
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Star List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {starsToDisplay.map((catalogStar, index) => (
                <motion.div
                  key={catalogStar.hyg.id}
                  className="rounded-lg p-3 cursor-pointer transition-all duration-300 border group"
                  // FIXED: Moved conditional styling from style prop to animate prop
                  animate={{
                    backdropFilter: 'blur(12px)',
                    background: selectedStar?.hyg.id === catalogStar.hyg.id
                      ? 'rgba(248, 250, 252, 0.06)' 
                      : 'rgba(248, 250, 252, 0.02)',
                    borderColor: selectedStar?.hyg.id === catalogStar.hyg.id
                      ? 'rgba(127, 255, 148, 0.2)' 
                      : 'rgba(248, 250, 252, 0.04)'
                  }}
                  transition={{
                    background: { duration: 0.3, ease: "easeOut" },
                    borderColor: { duration: 0.3, ease: "easeOut" }
                  }}
                  whileHover={{ 
                    scale: 1.01,
                    background: 'rgba(248, 250, 252, 0.08)',
                    borderColor: 'rgba(127, 255, 148, 0.3)'
                  }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleStarSelect(catalogStar, index)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center relative"
                      style={{
                        background: 'rgba(127, 255, 148, 0.1)',
                        border: '1px solid rgba(127, 255, 148, 0.2)'
                      }}
                    >
                      <StarIcon className="w-4 h-4 text-cosmic-observation" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-cosmic-observation font-light text-sm truncate group-hover:text-cosmic-light-echo transition-colors">
                        {catalogStar.hyg.proper || `HYG ${catalogStar.hyg.id}`}
                      </h4>
                      <p className="text-cosmic-stellar-wind text-xs font-light opacity-60 group-hover:opacity-80 transition-opacity truncate">
                        Magnitude: {catalogStar.hyg.mag.toFixed(2)}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-cosmic-stellar-wind opacity-0 group-hover:opacity-60 transition-all transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Star Detail Modal */}
      <AnimatePresence>
        {selectedStar && (
          <motion.div
            className="fixed inset-0 z-40 flex items-end justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseModal();
              }
            }}
          >
            <motion.div
              className="relative w-full max-w-2xl mx-6 rounded-2xl border overflow-hidden pointer-events-auto"
              style={{
                background: 'rgba(248, 250, 252, 0.03)',
                backdropFilter: 'blur(25px)',
                borderColor: `${STAR_SETTINGS.selected.color}33`,
                boxShadow: `0 20px 60px rgba(157, 78, 221, 0.3)`,
                marginBottom: '32px'
              }}
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-cosmic-stellar-wind hover:text-cosmic-observation transition-all duration-300 z-10 pointer-events-auto"
                style={{
                  background: 'rgba(248, 250, 252, 0.05)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(248, 250, 252, 0.1)'
                }}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6">
                <div className="flex items-center gap-6">
                  {/* Star Visualization */}
                  <div className="flex-shrink-0">
                    <div className="relative h-16 w-16 flex items-center justify-center">
                      <motion.div
                        className="relative rounded-full flex items-center justify-center"
                        style={{ 
                          background: selectedStar.render.color,
                          width: selectedStar.render.size * 64,
                          height: selectedStar.render.size * 64,
                          boxShadow: `0 0 30px ${selectedStar.render.color}40, 0 0 60px ${selectedStar.render.color}20`
                        }}
                        animate={{ 
                          scale: [1, 1.05, 1],
                          boxShadow: [
                            `0 0 30px ${selectedStar.render.color}40, 0 0 60px ${selectedStar.render.color}20`,
                            `0 0 40px ${selectedStar.render.color}60, 0 0 80px ${selectedStar.render.color}30`,
                            `0 0 30px ${selectedStar.render.color}40, 0 0 60px ${selectedStar.render.color}20`
                          ]
                        }}
                        transition={{ 
                          duration: 2.5, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <StarIcon className="w-6 h-6 text-white" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Star Information */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-light text-cosmic-observation mb-1 truncate">
                      {selectedStar.hyg.proper || `HYG ${selectedStar.hyg.id}`}
                    </h2>
                    
                    <div className="flex items-center gap-2 text-cosmic-stellar-wind text-xs mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="font-mono">
                        RA: {selectedStar.hyg.ra.toFixed(3)}°, Dec: {selectedStar.hyg.dec.toFixed(3)}°
                      </span>
                    </div>

                    <div className="text-cosmic-light-echo text-sm leading-relaxed font-light space-y-1">
                      <p>Magnitude: {selectedStar.hyg.mag.toFixed(2)}</p>
                      <p>Distance: {selectedStar.hyg.dist.toFixed(1)} parsecs</p>
                      {selectedStar.hyg.spect && <p>Spectral Class: {selectedStar.hyg.spect}</p>}
                      {selectedStar.hyg.con && <p>Constellation: {selectedStar.hyg.con}</p>}
                    </div>
                  </div>

                  {/* Dedicate Button */}
                  <div className="flex-shrink-0">
                    <motion.button
                      onClick={() => handleDedicate(selectedStar)}
                      className="text-cosmic-observation font-light py-3 px-6 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm pointer-events-auto"
                      style={{
                        backgroundColor: STAR_SETTINGS.selected.color,
                        boxShadow: `0 0 20px rgba(157, 78, 221, 0.3)`
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: `0 0 25px rgba(157, 78, 221, 0.4)`
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Heart className="w-4 h-4" />
                      Dedicate This Star
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}