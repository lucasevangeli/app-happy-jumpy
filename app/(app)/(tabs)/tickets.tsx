
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ticket, Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { useFocusEffect } from 'expo-router';

// Interface para a estrutura do ingresso
interface TicketData {
  id: string;
  code: string;
  itemName: string;
  itemDescription?: string;
  validated: boolean;
  createdAt: string;
  expiresAt?: string;
  userId: string;
}

const TicketStatus = ({ ticket }: { ticket: TicketData }) => {
  const getStatus = () => {
    if (ticket.validated) {
      return { text: 'UTILIZADO', style: styles.pillUtilizado };
    }
    if (ticket.expiresAt && new Date(ticket.expiresAt) < new Date()) {
      return { text: 'EXPIRADO', style: styles.pillExpirado };
    }
    return { text: 'VÁLIDO', style: styles.pillValido };
  };

  const status = getStatus();

  return (
    <View style={[styles.pillBase, status.style]}>
      <Text style={styles.pillText}>{status.text}</Text>
    </View>
  );
};

const TicketCard = ({ ticket }: { ticket: TicketData }) => {
  const [isCodeVisible, setIsCodeVisible] = useState(false);

  const getBorderColor = () => {
    if (ticket.validated) return 'rgba(239, 68, 68, 0.3)';
    if (ticket.expiresAt && new Date(ticket.expiresAt) < new Date()) return 'rgba(234, 179, 8, 0.3)';
    return 'rgba(34, 197, 94, 0.3)';
  };

  return (
    <View style={[styles.ticketCard, { borderColor: getBorderColor() }]}>
      <View style={styles.ticketTop}>
        <TicketStatus ticket={ticket} />
        <Text style={styles.ticketTitle}>{ticket.itemName}</Text>
        {ticket.itemDescription && (
          <Text style={styles.ticketDescription}>{ticket.itemDescription}</Text>
        )}
      </View>
      <View style={styles.ticketSeparatorContainer}>
        <View style={styles.ticketSeparatorCircle} />
        <View style={styles.ticketSeparatorLine} />
        <View style={styles.ticketSeparatorCircle} />
      </View>
      <View style={styles.ticketBottom}>
        <Text style={styles.codeLabel}>Código de Validação</Text>
        <TouchableOpacity
          style={styles.codeContainer}
          onPress={() => setIsCodeVisible(!isCodeVisible)}
          activeOpacity={0.7}
        >
          <Text style={styles.codeText}>
            {isCodeVisible ? ticket.code : '****-****'}
          </Text>
          {isCodeVisible ? (
            <EyeOff color="#9CA3AF" size={24} />
          ) : (
            <Eye color="#9CA3AF" size={24} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function TicketsScreen() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      setTickets([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ticketsRef = ref(database, 'tickets');
      const userTicketsQuery = query(ticketsRef, orderByChild('userId'), equalTo(user.uid));
      const snapshot = await get(userTicketsQuery);

      if (snapshot.exists()) {
        const ticketsData = snapshot.val();
        const loadedTickets: TicketData[] = Object.keys(ticketsData)
          .map((key) => ({
            id: key,
            ...ticketsData[key],
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTickets(loadedTickets);
      } else {
        setTickets([]);
      }
    } catch (err: any) {
      console.error("Erro ao buscar ingressos:", err);
      setError("Não foi possível carregar seus ingressos. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [fetchTickets])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets();
  }, [fetchTickets]);

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#00ff88" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
            <AlertCircle color="#EF4444" size={48}/>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!user) {
        return (
          <View style={styles.centered}>
            <Ticket color="#4B5563" size={48} />
            <Text style={styles.emptyText}>Faça login para ver seus ingressos.</Text>
          </View>
        );
      }

    if (tickets.length === 0) {
      return (
        <View style={styles.centered}>
          <Ticket color="#4B5563" size={48} />
          <Text style={styles.emptyText}>Você ainda não possui ingressos.</Text>
          <Text style={styles.emptySubText}>Compre na aba "Início" e eles aparecerão aqui!</Text>
        </View>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00ff88" />}
      >
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Meus Ingressos</Text>
            <Text style={styles.headerSubtitle}>Apresente o código na entrada para validação.</Text>
        </View>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#000',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: '#F87171',
    fontSize: 16,
    textAlign: 'center'
  },
  emptyText: {
    marginTop: 16,
    color: '#D1D5DB',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center'
  },
  emptySubText:{
    marginTop: 8,
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center'
  },
  scrollContent: {
    padding: 20,
  },
  ticketCard: {
    backgroundColor: 'rgba(24, 24, 27, 0.7)',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  ticketTop: {
    padding: 20,
  },
  pillBase: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginBottom: 12,
  },
  pillValido: { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
  pillUtilizado: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
  pillExpirado: { backgroundColor: 'rgba(234, 179, 8, 0.2)' },
  pillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  ticketTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  ticketDescription: {
    color: '#A1A1AA',
    fontSize: 14,
    marginTop: 4,
  },
  ticketSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  ticketSeparatorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    marginTop: -10,
    marginBottom: -10
  },
  ticketSeparatorLine: {
    flex: 1,
    height: 2,
    borderTopWidth: 2,
    borderTopColor: '#3F3F46',
    borderStyle: 'dashed',
  },
  ticketBottom: {
    padding: 20,
    alignItems: 'center',
  },
  codeLabel: {
    color: '#A1A1AA',
    fontSize: 14,
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeText: {
    color: '#22C55E',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    letterSpacing: 2,
  },
});
