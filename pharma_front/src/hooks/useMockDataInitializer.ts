import { useAppStore } from '@/store/appStore';
import { mockUsersForStore, mockProducts, mockCustomers, mockOrders } from '@/data/mockData';

export function useMockDataInitializer() {
  const { 
    users, 
    products, 
    customers, 
    orders,
    createUser,
    createProduct, 
    createCustomer,
    createOrder
  } = useAppStore();

  const initializeMockData = async () => {
    try {
      // Only initialize if data doesn't exist
      if (users.length === 0) {
        console.log('Initializing mock users...');
        for (const userData of mockUsersForStore) {
          await createUser(userData);
        }
      }

      if (products.length === 0) {
        console.log('Initializing mock products...');
        for (const productData of mockProducts) {
          await createProduct(productData);
        }
      }

      if (customers.length === 0) {
        console.log('Initializing mock customers...');
        for (const customerData of mockCustomers) {
          await createCustomer(customerData);
        }
      }

      if (orders.length === 0) {
        console.log('Initializing mock orders...');
        for (const orderData of mockOrders) {
          await createOrder(orderData);
        }
      }

      console.log('Mock data initialization complete');
    } catch (error) {
      console.error('Failed to initialize mock data:', error);
    }
  };

  return {
    initializeMockData,
    hasData: users.length > 0 || products.length > 0 || customers.length > 0 || orders.length > 0
  };
}