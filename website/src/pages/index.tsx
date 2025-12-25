import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/setup">
            Get Started 🚀
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/docs/intro"
            style={{marginLeft: '1rem'}}>
            Read the Docs 📚
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Documentation`}
      description="MonzieAI - AI-powered photo enhancement and social platform. Comprehensive documentation for developers.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />

        <section className={styles.quickLinks}>
          <div className="container">
            <div className="row">
              <div className="col col--12">
                <h2 className={styles.sectionTitle}>Quick Links</h2>
              </div>
            </div>
            <div className="row">
              <div className="col col--4">
                <div className={styles.quickLinkCard}>
                  <h3>🏗️ Architecture</h3>
                  <p>Learn about the system architecture, tech stack, and design patterns used in MonzieAI.</p>
                  <Link to="/docs/architecture">View Architecture →</Link>
                </div>
              </div>
              <div className="col col--4">
                <div className={styles.quickLinkCard}>
                  <h3>🔌 API Reference</h3>
                  <p>Complete API documentation with examples for all endpoints and integrations.</p>
                  <Link to="/docs/api">Explore API →</Link>
                </div>
              </div>
              <div className="col col--4">
                <div className={styles.quickLinkCard}>
                  <h3>🧪 Testing</h3>
                  <p>Testing strategies, coverage reports, and quality assurance guidelines.</p>
                  <Link to="/docs/testing">View Testing →</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.techStack}>
          <div className="container">
            <div className="row">
              <div className="col col--12">
                <h2 className={styles.sectionTitle}>Tech Stack</h2>
              </div>
            </div>
            <div className="row">
              <div className="col col--12">
                <div className={styles.techBadges}>
                  <span className={styles.techBadge}>React Native</span>
                  <span className={styles.techBadge}>Expo</span>
                  <span className={styles.techBadge}>TypeScript</span>
                  <span className={styles.techBadge}>Supabase</span>
                  <span className={styles.techBadge}>PostgreSQL</span>
                  <span className={styles.techBadge}>FAL.AI</span>
                  <span className={styles.techBadge}>RevenueCat</span>
                  <span className={styles.techBadge}>Google Sign-In</span>
                  <span className={styles.techBadge}>Apple Sign-In</span>
                  <span className={styles.techBadge}>React Query</span>
                  <span className={styles.techBadge}>Jest</span>
                  <span className={styles.techBadge}>Maestro</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <div className="container">
            <div className="row">
              <div className="col col--12">
                <div className={styles.ctaCard}>
                  <h2>Ready to contribute?</h2>
                  <p>Check out our contributing guidelines and start building with MonzieAI today!</p>
                  <div className={styles.ctaButtons}>
                    <Link
                      className="button button--primary button--lg"
                      to="/docs/contributing">
                      Contributing Guide
                    </Link>
                    <Link
                      className="button button--outline button--primary button--lg"
                      to="https://github.com/magnusmagi/monzieai"
                      style={{marginLeft: '1rem'}}>
                      View on GitHub
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
