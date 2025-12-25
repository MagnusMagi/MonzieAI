import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';
import { FiCpu, FiZap, FiShield, FiCamera, FiDollarSign, FiCode } from 'react-icons/fi';

type FeatureItem = {
  title: string;
  icon: React.ReactNode;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'AI-Powered Enhancement',
    icon: <FiCpu />,
    description: (
      <>
        Leverage cutting-edge AI models from FAL.AI to transform photos with advanced enhancement
        techniques, style transfers, and creative effects.
      </>
    ),
  },
  {
    title: 'Real-time Collaboration',
    icon: <FiZap />,
    description: (
      <>
        Built with React Native and Expo for seamless cross-platform performance. Real-time updates
        powered by Supabase for instant social interactions.
      </>
    ),
  },
  {
    title: 'Secure & Scalable',
    icon: <FiShield />,
    description: (
      <>
        Enterprise-grade security with Supabase authentication, Row Level Security, and encrypted
        data storage. Scales effortlessly with PostgreSQL backend.
      </>
    ),
  },
  {
    title: 'Rich Media Support',
    icon: <FiCamera />,
    description: (
      <>
        Advanced image processing with Expo Image, media library integration, and optimized storage
        with Supabase Storage buckets.
      </>
    ),
  },
  {
    title: 'Monetization Ready',
    icon: <FiDollarSign />,
    description: (
      <>
        Built-in RevenueCat integration for seamless subscription management, paywalls, and in-app
        purchases across iOS and Android.
      </>
    ),
  },
  {
    title: 'Developer Friendly',
    icon: <FiCode />,
    description: (
      <>
        Comprehensive documentation, TypeScript support, Jest testing suite, and E2E testing with
        Maestro for reliable development workflows.
      </>
    ),
  },
];

function Feature({ title, icon, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.feature}>
        <div className={styles.featureIcon}>{icon}</div>
        <h3 className={styles.featureTitle}>{title}</h3>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <div className="col col--12">
            <h2 className={styles.sectionTitle}>Why MonzieAI?</h2>
            <p className={styles.sectionSubtitle}>
              A comprehensive AI-powered photo platform built with modern technologies
            </p>
          </div>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
