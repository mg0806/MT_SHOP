import { CartProductType } from "@/app/product/[productId]/ProductDetails";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-hot-toast";

export type ShippingData = {
  shippingCharge: number;
  estimatedDays: string;
  pincode: string;
  courierName: string;
};

export const FREE_DELIVERY_THRESHOLD = 999;

type CartContextType = {
  cartTotalQty: number;
  cartTotalAmount: number;
  cartProducts: CartProductType[] | null;
  handleAddProductToCart: (product: CartProductType) => void;
  handleRemoveProductFromCart: (product: CartProductType) => void;
  handleCartQtyIncrease: (product: CartProductType) => void;
  handleCartQtyDecrease: (product: CartProductType) => void;
  handleClearCart: () => void;
  paymentIntent: string | null;
  handelSetPaymentIntent: (val: string | null) => void;
  totalWeight: number;
  // shippingCharges: number;
  grandTotalAmount: number;
  correctedGrandTotal: number;
  shippingData: ShippingData | null;
  setShippingData: (data: ShippingData | null) => void;
};

export const CartContext = createContext<CartContextType | null>(null);

interface Props {
  [propName: string]: any;
}

export const CartContextProvider = (props: Props) => {
  const [cartTotalAmount, setCartTotalAmount] = useState(0);
  const [cartTotalQty, setCartTotalQty] = useState(0);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [cartProducts, setCartProducts] = useState<CartProductType[] | null>(
    null,
  );
  const [grandTotalAmount, setGrandTotalAmount] = useState(0);
  const [correctedGrandTotal, setCorrectedGrandTotal] = useState(0);
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null);
  const getSubtotal = useCallback(
    () => cartProducts?.reduce((acc, p) => acc + p.price * p.quantity, 0) || 0,
    [cartProducts],
  );
  const getEffectiveShippingCharge = useCallback(
    () => (getSubtotal() >= FREE_DELIVERY_THRESHOLD ? 0 : Math.ceil(shippingData?.shippingCharge || 0)),
    [getSubtotal, shippingData],
  );
  // Using useEffect to make our page stay where we left after adding products to cart

  useEffect(() => {
    const cartItems = localStorage.getItem("MTshopCartItems");
    const MTShopPaymentIntent = localStorage.getItem("MTShopPaymentIntent");
    const MTShopShippingData = localStorage.getItem("MTShopShippingData");

    // Safely parse cart items
    const cProducts: CartProductType[] | null =
      cartItems && cartItems !== "undefined" ? JSON.parse(cartItems) : null;

    // Fix: Ensure valid JSON before parsing
    const paymentIntent: string | null =
      MTShopPaymentIntent && MTShopPaymentIntent !== "undefined"
        ? JSON.parse(MTShopPaymentIntent)
        : null;
    const parsedShippingData =
      MTShopShippingData && MTShopShippingData !== "undefined"
        ? JSON.parse(MTShopShippingData)
        : null;

    setCartProducts(cProducts);
    setPaymentIntent(paymentIntent);
    setShippingData(parsedShippingData);
  }, []);

  //subTotal Function
  useEffect(() => {
    const getTotal = () => {
      if (cartProducts) {
        const { total, qty } = cartProducts?.reduce(
          (acc, item) => {
            const itemTotal = item.price * item.quantity;

            acc.total = acc.total + itemTotal;
            acc.qty = acc.qty + item.quantity;

            return acc;
          },
          {
            total: 0,
            qty: 0,
          },
        );

        setCartTotalQty(qty);
        setCartTotalAmount(total);
      }
    };

    getTotal();
  }, [cartProducts]);

  const totalWeight =
    cartProducts?.reduce((acc, product) => {
      return acc + (product.weight || 0) * (product.quantity || 1);
    }, 0) || 0;

  // const shippingCharges = shippingData?.shippingCharge || 0;

  useEffect(() => {
    const total = getSubtotal() + getEffectiveShippingCharge();

    setGrandTotalAmount(total);
  }, [getEffectiveShippingCharge, getSubtotal]);

  // Calculate grand total with rounded shipping charges for secure payment
  useEffect(() => {
    const total = getSubtotal() + getEffectiveShippingCharge();

    setCorrectedGrandTotal(total);
  }, [getEffectiveShippingCharge, getSubtotal]);

  const handleAddProductToCart = useCallback((product: CartProductType) => {
    setCartProducts((prev) => {
      let updatedCart;

      if (prev) {
        updatedCart = [...prev, product];
      } else {
        updatedCart = [product];
      }

      // storing cart information into localStorage
      localStorage.setItem("MTshopCartItems", JSON.stringify(updatedCart));
      return updatedCart;
    });
    toast.success("Product added successfully");
  }, []);

  const handleRemoveProductFromCart = useCallback(
    (product: CartProductType) => {
      if (cartProducts) {
        const filteredProducts = cartProducts.filter((item) => {
          return item.id != product.id;
        });

        setCartProducts(filteredProducts);
        localStorage.setItem(
          "MTshopCartItems",
          JSON.stringify(filteredProducts),
        );
      }
      toast.success("Product Removed successfully");
    },
    [cartProducts],
  );

  const handleCartQtyIncrease = useCallback(
    (product: CartProductType) => {
      let updatedCart;
      if (cartProducts) {
        updatedCart = [...cartProducts];

        const existingIndex = cartProducts.findIndex(
          (item) => item.id === product.id,
        );

        if (existingIndex > -1) {
          updatedCart[existingIndex].quantity = ++updatedCart[existingIndex]
            .quantity;
        }

        setCartProducts(updatedCart);
        localStorage.setItem("MTshopCartItems", JSON.stringify(updatedCart));
      }
    },
    [cartProducts],
  );
  const handleCartQtyDecrease = useCallback(
    (product: CartProductType) => {
      let updatedCart;
      if (product.quantity === 1) {
        return toast.error("min reached");
      }

      if (cartProducts) {
        updatedCart = [...cartProducts];

        const existingIndex = cartProducts.findIndex(
          (item) => item.id === product.id,
        );

        if (existingIndex > -1) {
          updatedCart[existingIndex].quantity = --updatedCart[existingIndex]
            .quantity;
        }

        setCartProducts(updatedCart);
        localStorage.setItem("MTshopCartItems", JSON.stringify(updatedCart));
      }
    },
    [cartProducts],
  );

  const handleClearCart = useCallback(
    () => {
      setCartProducts(null);
      setCartTotalQty(0);
      setShippingData(null);
      localStorage.setItem("MTshopCartItems", JSON.stringify(null));
      localStorage.removeItem("MTShopShippingData");
    },
    [cartProducts],
    // removed content of dependency array  "cartProducts"
  );

  const handelSetPaymentIntent = useCallback((val: string | null) => {
    setPaymentIntent(val);
    if (val === null) {
      localStorage.removeItem("MTShopPaymentIntent");
    } else {
      localStorage.setItem("MTShopPaymentIntent", JSON.stringify(val));
    }
  }, []);
  useEffect(() => {
    if (shippingData) {
      localStorage.setItem("MTShopShippingData", JSON.stringify(shippingData));
    } else {
      localStorage.removeItem("MTShopShippingData");
    }
  }, [shippingData]);

  const value = {
    cartTotalQty,
    cartTotalAmount,
    cartProducts,
    handleAddProductToCart,
    handleRemoveProductFromCart,
    handleCartQtyIncrease,
    handleCartQtyDecrease,
    handleClearCart,
    paymentIntent,
    handelSetPaymentIntent,
    totalWeight,
    // shippingCharges,
    grandTotalAmount,
    correctedGrandTotal,
    shippingData,
    setShippingData,
  };

  return <CartContext.Provider value={value} {...props} />;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (context === null) {
    throw new Error("useCart must be used wiithin a CartContextProvider");
  }

  return context;
};
