// Jobs Listing Screen
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../theme/theme';
import { GradientHeader, JobCard, SearchBar, LoadingSkeleton, EmptyState } from '../../components/SharedComponents';
import { jobsAPI } from '../../services/api';

export default function JobsScreen({ navigation }: any) {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const load = useCallback(async () => {
        try {
            const res = await jobsAPI.getAll();
            setJobs(res.data?.jobs || res.data?.data || []);
        } catch (err) { console.log(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);
    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

    const filtered = jobs.filter(j => j.title?.toLowerCase().includes(search.toLowerCase()) || j.organization?.toLowerCase().includes(search.toLowerCase()));

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <GradientHeader title="Jobs Portal" subtitle={`${jobs.length} opportunities`} />
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search jobs..." />
            {loading ? <LoadingSkeleton count={5} /> : filtered.length === 0 ? (
                <EmptyState icon="briefcase-outline" title="No Jobs Found" message="Check back later for new opportunities" />
            ) : (
                <FlatList data={filtered}
                    renderItem={({ item, index }) => <JobCard job={item} onPress={() => navigation.navigate('JobDetail', { id: item.id })} index={index} />}
                    keyExtractor={item => item.id?.toString()}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: SPACING.sm, paddingBottom: 100 }}
                />
            )}
        </View>
    );
}
