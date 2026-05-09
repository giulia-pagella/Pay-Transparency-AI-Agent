import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { s } from '@/lib/pdf/utils/pdfStyles';

interface Props {
  num: string;
  title: string;
}

export function SectionHeader({ num, title }: Props) {
  return (
    <View style={s.pageHeader}>
      <Text style={s.pageHeaderText}>{num} · {title}</Text>
      <Text style={s.pageHeaderText}>Pay Transparency Assessment</Text>
    </View>
  );
}
