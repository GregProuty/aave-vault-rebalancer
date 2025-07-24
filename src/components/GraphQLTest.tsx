'use client';

import React from 'react';
import { useQuery, gql } from '@apollo/client';

const SIMPLE_TEST_QUERY = gql`
  query TestConnection {
    performanceMetrics {
      totalGain
      totalDaysTracked
    }
  }
`;

const GraphQLTest = () => {
  const { data, loading, error } = useQuery(SIMPLE_TEST_QUERY, {
    errorPolicy: 'all'
  });

  if (loading) {
    return <div className="text-yellow-400 text-sm">🔄 Testing GraphQL connection...</div>;
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm">
        ❌ GraphQL Error: {error.message}
      </div>
    );
  }

  if (!data?.performanceMetrics) {
    return <div className="text-orange-400 text-sm">⚠️ No performance data available</div>;
  }

  return (
    <div className="text-green-400 text-sm">
      ✅ GraphQL Connected: {data.performanceMetrics.totalDaysTracked} days, ${data.performanceMetrics.totalGain} total gain
    </div>
  );
};

export default GraphQLTest; 