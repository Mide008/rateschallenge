import {
  Document, Page, Text, View, StyleSheet,
} from '@react-pdf/renderer'

const s = StyleSheet.create({
  page:       { padding: 48, fontFamily: 'Helvetica', backgroundColor: '#FAFAF8' },
  coverTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1916', marginBottom: 6 },
  coverSub:   { fontSize: 10, color: '#706F6B', marginBottom: 32 },
  section:    { marginBottom: 20 },
  sectionHead:{ fontSize: 11, fontWeight: 'bold', color: '#1A1916', marginBottom: 8, paddingBottom: 4, borderBottom: '1pt solid #E4E2DC' },
  row:        { flexDirection: 'row', marginBottom: 5 },
  label:      { fontSize: 9, color: '#706F6B', width: 140 },
  value:      { fontSize: 9, color: '#1A1916', flex: 1 },
  highlight:  { backgroundColor: '#EFF4FF', padding: 12, borderRadius: 4, marginBottom: 16 },
  bigNum:     { fontSize: 26, fontWeight: 'bold', color: '#B91C1C', marginBottom: 2 },
  bigLabel:   { fontSize: 9, color: '#706F6B' },
  narrative:  { fontSize: 9.5, color: '#374151', lineHeight: 1.7, marginBottom: 8 },
  tableHead:  { flexDirection: 'row', backgroundColor: '#F5F4F1', paddingVertical: 5, paddingHorizontal: 4 },
  tableRow:   { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 4, borderBottom: '0.5pt solid #E4E2DC' },
  thCell:     { fontSize: 7.5, fontWeight: 'bold', color: '#706F6B' },
  tdCell:     { fontSize: 7.5, color: '#1A1916' },
  footer:     { position: 'absolute', bottom: 28, left: 48, right: 48, fontSize: 7.5, color: '#97948C', textAlign: 'center' },
  disclaimer: { fontSize: 8, color: '#97948C', lineHeight: 1.6, marginTop: 16 },
})

interface Props {
  analysis: {
    userRvPerM2:     number
    medianRvPerM2:   number
    percentile:      number
    potentialSaving: number
  }
  comparables: Array<{
    full_address:   string
    postcode:       string
    rateable_value: number
    total_area:     number
    rv_per_m2:      number
  }>
  property: {
    address:         string
    postcode:        string
    descriptionText: string
    floorArea:       number
    rateableValue:   number
  }
}

const fmt  = (n: number) => `£${n.toLocaleString('en-GB')}`
const fmt2 = (n: number) => `£${n.toFixed(2)}`
const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export function EvidenceBundle({ analysis, comparables, property }: Props) {
  const diff    = analysis.userRvPerM2 - analysis.medianRvPerM2
  const diffPct = Math.abs(Math.round((diff / analysis.medianRvPerM2) * 100))

  return (
    <Document title="Business Rates Challenge Evidence Bundle" author="RatesChallenge">

      {/* ── COVER ── */}
      <Page size="A4" style={s.page}>
        <Text style={s.coverTitle}>Business Rates Challenge{'\n'}Evidence Bundle</Text>
        <Text style={s.coverSub}>Prepared by RatesChallenge.co.uk · {today}</Text>

        <View style={s.section}>
          <Text style={s.sectionHead}>Subject Property</Text>
          {[
            ['Address',         property.address],
            ['Postcode',        property.postcode],
            ['Property type',   property.descriptionText],
            ['Floor area',      `${property.floorArea} m²`],
            ['Rateable value',  fmt(property.rateableValue)],
            ['RV per m²',       fmt2(analysis.userRvPerM2)],
          ].map(([label, value]) => (
            <View key={label} style={s.row}>
              <Text style={s.label}>{label}</Text>
              <Text style={s.value}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={[s.highlight, s.section]}>
          <Text style={s.bigNum}>{fmt2(analysis.userRvPerM2)} / m²</Text>
          <Text style={s.bigLabel}>
            Your RV/m² is {diffPct}% {diff > 0 ? 'above' : 'below'} the comparable median of {fmt2(analysis.medianRvPerM2)}/m²
          </Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionHead}>Analysis Summary</Text>
          {[
            ['Comparable median RV/m²', fmt2(analysis.medianRvPerM2)],
            ['Your percentile',         `${analysis.percentile}th (${analysis.percentile > 60 ? 'above' : 'below'} median)`],
            ['Comparables analysed',    comparables.length.toString()],
            ['Potential RV overstated', fmt(analysis.potentialSaving)],
            ['Est. excess rates / yr',  fmt(Math.round(analysis.potentialSaving * 0.512))],
          ].map(([label, value]) => (
            <View key={label} style={s.row}>
              <Text style={s.label}>{label}</Text>
              <Text style={s.value}>{value}</Text>
            </View>
          ))}
        </View>

        <Text style={s.footer}>
          RatesChallenge.co.uk · Data source: VOA 2023 Compiled Rating List · Page 1
        </Text>
      </Page>

      {/* ── GROUNDS ── */}
      <Page size="A4" style={s.page}>
        <Text style={[s.sectionHead, { fontSize: 13, marginBottom: 16 }]}>Grounds for Challenge</Text>

        <Text style={s.narrative}>
          The subject property at {property.address} ({property.postcode}) is assessed at a rateable 
          value of {fmt(property.rateableValue)} on the 2023 Rating List, equating to {fmt2(analysis.userRvPerM2)} per m² 
          based on a floor area of {property.floorArea} m².
        </Text>
        <Text style={s.narrative}>
          Analysis of {comparables.length} comparable {property.descriptionText} properties of similar size 
          ({property.floorArea} m² ±30%) within the same or adjacent postcode area reveals a median 
          rateable value of {fmt2(analysis.medianRvPerM2)} per m².
        </Text>
        <Text style={s.narrative}>
          The subject property is assessed at the {analysis.percentile}th percentile of the comparable 
          evidence set. This position — {diffPct}% above the local median — suggests that the current 
          assessment may not accurately reflect the tone of the list in this locality.
        </Text>
        {analysis.potentialSaving > 0 && (
          <Text style={s.narrative}>
            A rateable value consistent with comparable evidence would be in the region of 
            {fmt(Math.round(analysis.medianRvPerM2 * property.floorArea * 0.9))}–
            {fmt(Math.round(analysis.medianRvPerM2 * property.floorArea * 1.1))}, representing 
            an estimated annual saving of {fmt(Math.round(analysis.potentialSaving * 0.512))} 
            at the 2024/25 multiplier.
          </Text>
        )}
        <Text style={s.narrative}>
          The ratepayer therefore respectfully requests that the Valuation Office Agency review 
          the assessment in light of the comparable evidence presented in this bundle.
        </Text>

        <Text style={[s.sectionHead, { marginTop: 20 }]}>How to Submit</Text>
        <Text style={s.narrative}>
          1. Visit www.gov.uk/guidance/check-and-challenge-your-business-rates-valuation{'\n'}
          2. Select "Check your valuation" and search for your property{'\n'}
          3. If the details are incorrect, raise a Check{'\n'}
          4. After the Check, if you disagree with the outcome, raise a Challenge{'\n'}
          5. Upload this evidence bundle as supporting documentation{'\n'}
          6. Deadline: Challenges must be submitted before the 2023 list closes
        </Text>

        <Text style={s.footer}>
          RatesChallenge.co.uk · Data source: VOA 2023 Compiled Rating List · Page 2
        </Text>
      </Page>

      {/* ── COMPARABLES TABLE ── */}
      <Page size="A4" style={{ ...s.page, paddingTop: 36 }}>
        <Text style={[s.sectionHead, { fontSize: 13, marginBottom: 12 }]}>
          Comparable Evidence — {comparables.length} properties
        </Text>

        <View style={s.tableHead}>
          {[
            { label: 'Address',   w: '35%' },
            { label: 'Postcode',  w: '13%' },
            { label: 'RV (£)',    w: '14%' },
            { label: 'Area (m²)', w: '14%' },
            { label: '£/m²',      w: '12%' },
            { label: 'vs yours',  w: '12%' },
          ].map(col => (
            <Text key={col.label} style={[s.thCell, { width: col.w }]}>{col.label}</Text>
          ))}
        </View>

        {comparables.map((comp, i) => {
          const vs     = ((comp.rv_per_m2 - analysis.userRvPerM2) / analysis.userRvPerM2 * 100).toFixed(0)
          const vsSign = Number(vs) > 0 ? '+' : ''
          // Safely get values with fallbacks
          const areaValue   = Number(comp.total_area)    || 0
          const rvValue     = Number(comp.rateable_value) || 0
          const rvPerM2Value = Number(comp.rv_per_m2)    || 0
          const addressText = comp.full_address || 'Address not available'
          const postcodeText = comp.postcode || 'N/A'
          
          return (
            <View key={i} style={[s.tableRow, { backgroundColor: i % 2 === 0 ? '#FAFAF8' : '#FFFFFF' }]}>
              <Text style={[s.tdCell, { width: '35%' }]}>
                {addressText}
              </Text>
              <Text style={[s.tdCell, { width: '13%' }]}>
                {postcodeText}
              </Text>
              <Text style={[s.tdCell, { width: '14%', textAlign: 'right' }]}>
                {rvValue > 0 ? fmt(rvValue) : '—'}
              </Text>
              <Text style={[s.tdCell, { width: '14%', textAlign: 'right' }]}>
                {areaValue > 0 ? areaValue.toFixed(0) : '—'}
              </Text>
              <Text style={[s.tdCell, { width: '12%', textAlign: 'right' }]}>
                {rvPerM2Value > 0 ? fmt2(rvPerM2Value) : '—'}
              </Text>
              <Text style={[s.tdCell, { width: '12%', textAlign: 'right', color: Number(vs) > 0 ? '#15803D' : '#B91C1C' }]}>
                {vsSign}{vs}%
              </Text>
            </View>
          )
        })}

        <Text style={[s.disclaimer]}>
          Source: Valuation Office Agency 2023 Compiled Rating List. Data retrieved {today}.
          RatesChallenge provides data analysis only and is not a rating agent, surveyor, or legal adviser.
          This document does not constitute professional valuation advice. For complex or high-value 
          challenges, consult a RICS-accredited rating surveyor.
        </Text>

        <Text style={s.footer}>
          RatesChallenge.co.uk · Data source: VOA 2023 Compiled Rating List · Page 3
        </Text>
      </Page>

    </Document>
  )
}