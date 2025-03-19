import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchDrinkById } from "../../redux/slices/drinkSlice";
import { addToCart } from "../../redux/slices/cartSlice";
import { Helmet } from "react-helmet";
import LoadingSpinner from "../../Components/LoadingSpinner";
import toast from "react-hot-toast";
import { FaShoppingCart } from "react-icons/fa";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import { formatPrice } from "../../utils/formatUtils";

const TopDrink = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const {
    currentDrink: display,
    loading,
    error,
  } = useSelector((state) => state.drink);
  const [quantity, setQuantity] = useState(1);
  const cartItems = useSelector((state) => state.cart.items);

  const itemInCart = cartItems.find(
    (item) => display && item._id === display._id,
  );
  const currentCartQty = itemInCart ? itemInCart.quantity : 0;

  useEffect(() => {
    if (id) {
      dispatch(fetchDrinkById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (display && display.drinkQuantity) {
      const maxQuantity = Math.max(
        1,
        parseInt(display.drinkQuantity) - currentCartQty,
      );
      setQuantity(Math.min(quantity, maxQuantity));
    }
  }, [display, currentCartQty]);

  const handleAddToCart = () => {
    const availableQty = parseInt(display?.drinkQuantity) || 0;

    if (availableQty <= 0) {
      toast.error(`${display.drinkName} is currently out of stock!`);
      return;
    }

    if (currentCartQty + quantity > availableQty) {
      toast.error(
        `Cannot add ${quantity} more. Only ${availableQty - currentCartQty} available to add!`,
      );
      return;
    }

    dispatch(
      addToCart({
        item: display,
        quantity,
      }),
    );
    toast.success(`${display.drinkName} added to cart!`);
  };

  // Calculate remaining available quantity
  const remainingQty = display
    ? Math.max(0, parseInt(display.drinkQuantity) - currentCartQty)
    : 0;
  const isOutOfStock = remainingQty <= 0;

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="text-red-500 text-center py-10 bg-[#121212]">
        Error: {error}
      </div>
    );
  if (!display)
    return (
      <div className="text-white text-center py-10 bg-[#121212]">
        Loading drink details...
      </div>
    );

  return (
    <>
      {/* <Header2 /> */}
      <Helmet>
        <title>Tim's Kitchen | See-Drink </title>
      </Helmet>
      <div className="bg-[#121212] lg:px-28 px-6 lg:py-0 py-44 lg:pt-20 flex md:h-screen justify-center items-center">
        <Card className="w-full max-w-[48rem]  flex flex-col lg:flex-row">
          <CardHeader
            shadow={false}
            floated={false}
            className="m-0 w-full md:w-2/5 shrink-0 rounded-r-none"
          >
            <img
              src={display.drinkImage}
              alt="card-image"
              className="lg:h-full  lg:w-full lg:object-cover"
            />
          </CardHeader>
          <CardBody className=" lg:px-10">
            <Typography variant="h6" color="gray" className="mb-4 uppercase">
              {display.drinkCategory}
            </Typography>
            <Typography variant="h4" color="blue-gray" className="mb-2">
              {display.drinkName}
            </Typography>
            <Typography variant="h6" color="gray" className="mb-2">
              Country : {display.drinkOrigin}
            </Typography>
            <Typography variant="h6" color="gray" className="mb-2">
              Price : {formatPrice(parseFloat(display.drinkPrice))}
            </Typography>
            <Typography variant="h6" color="gray" className="mb-2">
              Made By : {display.chefName}
            </Typography>
            <Typography color="gray" className="mb-8 font-normal">
              {display.drinkDescription}
            </Typography>

            {isOutOfStock ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                <p className="font-bold">Out of Stock</p>
                <p className="text-sm">This item is currently unavailable</p>
              </div>
            ) : (
              currentCartQty > 0 && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded mb-4">
                  <p className="font-bold">Already In Cart: {currentCartQty}</p>
                  <p className="text-sm">
                    You can add {remainingQty} more of this item
                  </p>
                </div>
              )
            )}

            {/* Quantity selector */}
            <div className="mb-4">
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Quantity
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  className="p-2 border border-gray-300 rounded-l"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock}
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={remainingQty}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.min(
                        remainingQty,
                        Math.max(1, parseInt(e.target.value) || 1),
                      ),
                    )
                  }
                  className="w-16 text-center border-y border-gray-300 py-2"
                  disabled={isOutOfStock}
                />
                <button
                  type="button"
                  className="p-2 border border-gray-300 rounded-r"
                  onClick={() =>
                    setQuantity(Math.min(remainingQty, quantity + 1))
                  }
                  disabled={isOutOfStock}
                >
                  +
                </button>
                <span
                  className={`ml-4 text-sm ${isOutOfStock ? "text-red-500 font-bold" : "text-gray-500"}`}
                >
                  Available to add: {remainingQty} (Total in stock:{" "}
                  {display.drinkQuantity})
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                variant="text"
                color={isOutOfStock ? "gray" : "yellow"}
                className={`flex items-center gap-1 ${isOutOfStock ? "opacity-60 cursor-not-allowed" : ""}`}
                onClick={handleAddToCart}
                disabled={isOutOfStock || quantity <= 0}
              >
                <FaShoppingCart className="h-4 w-4" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
};

export default TopDrink;
