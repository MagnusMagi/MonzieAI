import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import {
  FiArrowRight,
  FiBook,
  FiGithub,
  FiCode,
  FiDatabase,
  FiZap,
  FiCpu,
  FiLayers,
  FiPackage,
} from 'react-icons/fi';
import { SiReact, SiTypescript, SiPostgresql, SiJest } from 'react-icons/si';

import styles from './index.module.css';

// Particle effect component
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    const particleCount = 50;
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = isDarkMode
          ? `rgba(167, 139, 250, ${particle.opacity})`
          : `rgba(109, 40, 217, ${particle.opacity})`;
        ctx.fill();

        // Draw connections
        particles.forEach((otherParticle, j) => {
          if (i === j) return;
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = isDarkMode
              ? `rgba(167, 139, 250, ${0.1 * (1 - distance / 120)})`
              : `rgba(109, 40, 217, ${0.1 * (1 - distance / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.particleCanvas} aria-hidden="true" />;
}

// Scroll reveal hook
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealed);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const elements = document.querySelectorAll(`.${styles.scrollReveal}`);
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <Particles />
      <div className={clsx('container', styles.heroContent)}>
        <div className={clsx(styles.heroText, isVisible && styles.fadeInUp)}>
          <h1 className="hero__title">
            <span className={styles.titleWord}>MonzieAI</span>
            <span className={styles.titleWord}>Documentation</span>
          </h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx('button button--primary button--lg', styles.ctaButton)}
              to="/docs/setup"
            >
              <span>Get Started</span>
              <span className={styles.buttonIcon}>
                <FiArrowRight />
              </span>
            </Link>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.ctaButton
              )}
              to="/docs/intro"
            >
              <span>Read the Docs</span>
              <span className={styles.buttonIcon}>
                <FiBook />
              </span>
            </Link>
          </div>
        </div>

        {/* Stats badges */}
        <div className={clsx(styles.statsBadges, isVisible && styles.fadeInUp)}>
          <div className={styles.statBadge}>
            <div className={styles.statNumber}>15+</div>
            <div className={styles.statLabel}>Documentation Pages</div>
          </div>
          <div className={styles.statBadge}>
            <div className={styles.statNumber}>100+</div>
            <div className={styles.statLabel}>AI Scenes</div>
          </div>
          <div className={styles.statBadge}>
            <div className={styles.statNumber}>75%+</div>
            <div className={styles.statLabel}>Test Coverage</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollMouse}>
          <div className={styles.scrollWheel}></div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  useScrollReveal();

  return (
    <Layout
      title={`${siteConfig.title} - Documentation`}
      description="MonzieAI - AI-powered photo enhancement and social platform. Comprehensive documentation for developers."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />

        {/* Wave Divider */}
        <div className={styles.waveDivider}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>

        <section className={clsx(styles.quickLinks, styles.scrollReveal)}>
          <div className="container">
            <div className="row">
              <div className="col col--12">
                <h2 className={styles.sectionTitle}>Quick Links</h2>
                <p className={styles.sectionSubtitle}>Jump directly to what you need</p>
              </div>
            </div>
            <div className="row">
              <div className="col col--4">
                <div className={styles.quickLinkCard}>
                  <div className={styles.quickLinkIcon}>
                    <FiLayers />
                  </div>
                  <h3>Architecture</h3>
                  <p>
                    Learn about the system architecture, tech stack, and design patterns used in
                    MonzieAI.
                  </p>
                  <Link to="/docs/architecture">
                    View Architecture <FiArrowRight />
                  </Link>
                </div>
              </div>
              <div className="col col--4">
                <div className={styles.quickLinkCard}>
                  <div className={styles.quickLinkIcon}>
                    <FiCode />
                  </div>
                  <h3>API Reference</h3>
                  <p>
                    Complete API documentation with examples for all endpoints and integrations.
                  </p>
                  <Link to="/docs/api">
                    Explore API <FiArrowRight />
                  </Link>
                </div>
              </div>
              <div className="col col--4">
                <div className={styles.quickLinkCard}>
                  <div className={styles.quickLinkIcon}>
                    <FiZap />
                  </div>
                  <h3>Testing</h3>
                  <p>Testing strategies, coverage reports, and quality assurance guidelines.</p>
                  <Link to="/docs/testing">
                    View Testing <FiArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wave Divider */}
        <div className={clsx(styles.waveDivider, styles.waveDividerFlipped)}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>

        <section className={clsx(styles.techStack, styles.scrollReveal)}>
          <div className="container">
            <div className="row">
              <div className="col col--12">
                <h2 className={styles.sectionTitle}>Tech Stack</h2>
                <p className={styles.sectionSubtitle}>
                  Built with modern, production-ready technologies
                </p>
              </div>
            </div>
            <div className="row">
              <div className="col col--12">
                <div className={styles.techBadges}>
                  <span className={styles.techBadge}>
                    <SiReact /> React Native
                  </span>
                  <span className={styles.techBadge}>
                    <FiPackage /> Expo
                  </span>
                  <span className={styles.techBadge}>
                    <SiTypescript /> TypeScript
                  </span>
                  <span className={styles.techBadge}>
                    <FiDatabase /> Supabase
                  </span>
                  <span className={styles.techBadge}>
                    <SiPostgresql /> PostgreSQL
                  </span>
                  <span className={styles.techBadge}>
                    <FiCpu /> FAL.AI
                  </span>
                  <span className={styles.techBadge}>
                    <FiZap /> RevenueCat
                  </span>
                  <span className={styles.techBadge}>
                    <FiPackage /> Google Sign-In
                  </span>
                  <span className={styles.techBadge}>
                    <FiPackage /> Apple Sign-In
                  </span>
                  <span className={styles.techBadge}>
                    <FiCode /> React Query
                  </span>
                  <span className={styles.techBadge}>
                    <SiJest /> Jest
                  </span>
                  <span className={styles.techBadge}>
                    <FiZap /> Maestro
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wave Divider */}
        <div className={styles.waveDivider}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>

        <section className={clsx(styles.cta, styles.scrollReveal)}>
          <div className="container">
            <div className="row">
              <div className="col col--12">
                <div className={styles.ctaCard}>
                  <div className={styles.ctaIcon}>
                    <FiZap size={48} />
                  </div>
                  <h2>Ready to contribute?</h2>
                  <p>
                    Check out our contributing guidelines and start building with MonzieAI today!
                  </p>
                  <div className={styles.ctaButtons}>
                    <Link
                      className={clsx('button button--primary button--lg', styles.ctaButton)}
                      to="/docs/contributing"
                    >
                      <span>Contributing Guide</span>
                      <span className={styles.buttonIcon}>
                        <FiArrowRight />
                      </span>
                    </Link>
                    <Link
                      className={clsx(
                        'button button--outline button--primary button--lg',
                        styles.ctaButton
                      )}
                      to="https://github.com/magnusmagi/monzieai"
                    >
                      <span>View on GitHub</span>
                      <span className={styles.buttonIcon}>
                        <FiGithub />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
