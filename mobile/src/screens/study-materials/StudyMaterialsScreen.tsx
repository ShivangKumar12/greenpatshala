// Study Materials Screen
import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { COLORS, SPACING } from '../../theme/theme';
import { GradientHeader, MaterialCard, SearchBar, LoadingSkeleton, EmptyState } from '../../components/SharedComponents';
import { studyMaterialsAPI } from '../../services/api';

export default function StudyMaterialsScreen({ navigation }: any) {
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const load = useCallback(async () => {
        try {
            const res = await studyMaterialsAPI.getAll();
            setMaterials(res.data?.materials || res.data?.data || []);
        } catch (err) { console.log(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);
    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
    const filtered = materials.filter(m => m.title?.toLowerCase().includes(search.toLowerCase()));

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <GradientHeader title="Study Materials" subtitle={`${materials.length} resources`} />
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search materials..." />
            {loading ? <LoadingSkeleton count={5} /> : filtered.length === 0 ? (
                <EmptyState icon="document-text-outline" title="No Materials" message="Check back later" />
            ) : (
                <FlatList data={filtered}
                    renderItem={({ item, index }) => <MaterialCard material={item} onPress={() => navigation.navigate('MaterialDetail', { id: item.id })} index={index} />}
                    keyExtractor={item => item.id?.toString()}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: SPACING.sm, paddingBottom: 100 }}
                />
            )}
        </View>
    );
}
