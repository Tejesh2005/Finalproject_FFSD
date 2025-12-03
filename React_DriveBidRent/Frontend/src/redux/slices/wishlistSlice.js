import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getWishlist, addToWishlist, removeFromWishlist } from '../../services/buyer.services';

// Async thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      return await getWishlist();
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch wishlist');
    }
  }
);

export const addWishlistItem = createAsyncThunk(
  'wishlist/addWishlistItem',
  async ({ id, type }, { rejectWithValue }) => {
    try {
      await addToWishlist(id, type);
      return { id, type };
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to add to wishlist');
    }
  }
);

export const removeWishlistItem = createAsyncThunk(
  'wishlist/removeWishlistItem',
  async ({ id, type }, { rejectWithValue }) => {
    try {
      await removeFromWishlist(id, type);
      return { id, type };
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to remove from wishlist');
    }
  }
);

const initialState = {
  auctions: [],
  rentals: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.auctions = action.payload.auctions || [];
        state.rentals = action.payload.rentals || [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch wishlist';
      })
      .addCase(addWishlistItem.fulfilled, (state, action) => {
        // Refetching is recommended, but for optimistic update:
        // No-op, UI should trigger fetchWishlist after add
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        // Refetching is recommended, but for optimistic update:
        // No-op, UI should trigger fetchWishlist after remove
      });
  },
});

export default wishlistSlice.reducer;