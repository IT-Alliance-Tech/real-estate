import React from 'react';
import { Box, Typography, Button, Container, useTheme, useMediaQuery } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const ads = [
  {
    id: 1,
    title: "Zero Brokerage, 100% Trust",
    subtitle: "Connect directly with verified owners. No middlemen, no hidden fees.",
    cta: "Explore Plans",
    bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "Unlock Verified Owners",
    subtitle: "Get access to contact details of genuine property owners instantly.",
    cta: "Get Access Now",
    bgGradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "Premium Support & Assistance",
    subtitle: "Dedicated relationship manager to help you find your dream home faster.",
    cta: "Upgrade Today",
    bgGradient: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

const SubscriptionAdBanner = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        py: { xs: 4, sm: 5, md: 6 },
        bgcolor: '#f5f7fa',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <Container maxWidth="lg">

        {/* Wrapper to fix 100% height and consistent layout */}
        <Box sx={{ width: '100%', height: '100%', borderRadius: 3 }}>

          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            slidesPerView={1}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            loop={true}
            style={{
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
            }}
          >
            {ads.map((ad) => (
              <SwiperSlide key={ad.id}>
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 340, sm: 360, md: 420, lg: 450 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    background: ad.bgGradient
                  }}
                >

                  {/* Background Image */}
                  <Box
                    component="img"
                    src={ad.image}
                    alt={ad.title}
                    sx={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      height: '100%',
                      width: { xs: '100%', md: '60%' },
                      objectFit: 'cover',
                      opacity: 0.22,
                      maskImage: 'linear-gradient(to left, black 45%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to left, black 45%, transparent 100%)'
                    }}
                  />

                  {/* Main Content */}
                  <Box
                    sx={{
                      position: 'relative',
                      zIndex: 2,
                      pl: { xs: 2, sm: 3, md: 6 },
                      pr: { xs: 2, sm: 3 },
                      maxWidth: { xs: '100%', md: '55%' },
                      textAlign: { xs: 'center', md: 'left' },
                      color: '#fff',
                    }}
                  >
                    <Typography
                      variant={isMobile ? "h4" : "h2"}
                      fontWeight={800}
                      gutterBottom
                      sx={{
                        textShadow: '0 3px 12px rgba(0,0,0,0.25)'
                      }}
                    >
                      {ad.title}
                    </Typography>

                    <Typography
                      variant={isMobile ? "body1" : "h5"}
                      sx={{
                        mb: 4,
                        opacity: 0.95,
                        fontWeight: 400,
                      }}
                    >
                      {ad.subtitle}
                    </Typography>

                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/subscription-plans')}
                      sx={{
                        bgcolor: '#fff',
                        color: '#333',
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.5,
                        borderRadius: '50px',
                        fontSize: '1.05rem',
                        boxShadow: '0 12px 25px rgba(0,0,0,0.20)',
                        '&:hover': {
                          bgcolor: '#f7f7f7',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 20px 30px rgba(0,0,0,0.25)'
                        },
                        transition: '0.25s ease'
                      }}
                    >
                      {ad.cta}
                    </Button>
                  </Box>
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Container>
    </Box>
  );
};

export default SubscriptionAdBanner;
