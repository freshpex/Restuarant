import { useDispatch } from 'react-redux';
import { Link } from "react-router-dom";
import { addToCart } from "../../redux/slices/cartSlice";
import toast from 'react-hot-toast';
import { FaShoppingCart } from 'react-icons/fa';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { formatPrice } from '../../utils/formatUtils';

export default function TopFoodCard({ food }) {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({
      item: food,
      quantity: 1
    }));
    toast.success(`${food.foodName} added to cart!`);
  };

  return (
    <Card className="w-full max-w-[24rem] shadow-lg mx-auto">
      <CardHeader floated={false} color="blue-gray" className="relative h-64">
        <img
          src={food.foodImage}
          alt={food.foodName}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Typography variant="h5" color="white" className="text-center font-bold">
            Top Selling
          </Typography>
        </div>
      </CardHeader>
      <CardBody>
        <div className="mb-3 flex items-center justify-between">
          <Typography variant="h5" color="blue-gray" className="font-medium">
            {food.foodName}
          </Typography>
          <Typography variant="h5" color="blue-gray" className="font-medium">
          {formatPrice(parseFloat(food.foodPrice))}
          </Typography>
        </div>
        <Typography color="gray" className="font-normal mb-2 line-clamp-2">
          {food.foodDescription || "A delicious meal prepared with the finest ingredients."}
        </Typography>
        <div className="flex items-center justify-between">
          <Typography variant="small" color="blue-gray">
            {food.foodCategory || "Main Course"}
          </Typography>
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-yellow-700"
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
              />
            </svg>
            <Typography color="blue-gray" className="font-medium">5.0</Typography>
          </div>
        </div>
      </CardBody>
      <CardFooter className="pt-3 flex gap-2">
        <Link to={`/topFood/${food._id}`} className="flex-1">
          <Button size="sm" fullWidth={true}>
            View Details
          </Button>
        </Link>
        <Button 
          size="sm" 
          color="yellow" 
          className="flex items-center justify-center gap-2"
          onClick={handleAddToCart}
        >
          <FaShoppingCart size={14} />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
