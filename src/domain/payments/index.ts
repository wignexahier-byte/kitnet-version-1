/**
 * Domain - Payments (Regras Oficiais de Pagamentos e Baixas de Parcelas)
 *
 * Centraliza e oficializa:
 * - Regra de 1º Pagamento no cadastro (confirmação explícita de entrada)
 * - Baixa de parcelas (quitação com forma de pagamento e data)
 * - Estorno de parcelas para pendente
 */

export { paymentService } from '../../services/paymentService';
export type { FirstPaymentSetupOptions } from '../../services/paymentService';
