import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Order from '../views/Order.vue'
import ListOrder from '../views/ListOrder.vue'
import UserPoint from '../views/UserPoint.vue'
import ListIncomingOrder from '../views/ListIncomingOrder.vue'
import ListSaleItem from '../views/ListSaleItem.vue'
import ItemDetail from '../views/ItemDetail.vue'
import ItemDetailSupplier from '../views/ItemDetailSupplier.vue'
import SupplierStorefront from '../views/SupplierStorefront.vue'
import Storefront from '../views/Storefront.vue'
import OrderSuccess from '../views/OrderSuccess.vue'
import OrderConfirmation from '../views/OrderConfirmation.vue'
import OutcomingOrder from '../views/OutcomingOrder.vue'
import IncomingOrder from '../views/IncomingOrder.vue'
import Setting from '../views/Admin/Setting.vue'
import Cart from '../views/Cart.vue'
import Profile from '../views/Profile.vue'
import UserAddress from '../views/UserAddress.vue'

// admin's views component
import Item from '../views/Admin/Item.vue'
import Promo from '../views/Admin/Promo.vue'

import Featured from '../views/Admin/Featured.vue'
import Report from '../views/Admin/Report.vue'
import Slide from '../views/Admin/Slide.vue'
import MasterProduct from '../views/Admin/MasterProduct.vue'
import Product from '../views/Admin/Product.vue'
// import ProductStock from '../views/Admin/ProductStock.vue';
import ProductCategory from '../views/Admin/ProductCategory.vue'
import ProductBrand from '../views/Admin/ProductBrand.vue'
import ProductImage from '../views/Admin/ProductImage.vue'
import Unit from '../views/Admin/Unit.vue'
import Purchase from '../views/Admin/Purchase.vue'
import PurchaseDetail from '../views/Admin/PurchaseDetail.vue'
import PurchaseItem from '../views/Admin/PurchaseItem.vue'
import Point from '../views/Admin/Point.vue'
import User from '../views/Admin/User.vue'
import Dealer from '../views/Admin/Dealer.vue'
import DealerDetail from '../views/Admin/DealerDetail.vue'
import Depot from '../views/Admin/Depot.vue'
// import Role from '../views/Admin/Role.vue';
import Sale from '../views/Admin/Sale.vue'
import SaleItem from '../views/Admin/SaleItem.vue'
import Store from '../views/Admin/Store.vue'
import Address from '../views/Admin/Address.vue'

import { checkTokenExp, refreshToken } from '../services'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      auth: true,
      title: 'Home',
      roles: ['admin', 'depot', 'dealer'],
    },
  },
  {
    path: '/orders',
    name: 'order',
    component: Order,
    meta: {
      auth: true,
      title: 'Order',
      roles: ['depot', 'admin'],
    },
  },
  {
    path: '/user-address',
    name: 'userAddress',
    component: UserAddress,
    meta: {
      auth: true,
      title: 'User Address',
      roles: ['admin', 'depot', 'dealer'],
    },
  },
  {
    path: '/list-orders',
    name: 'listOrder',
    component: ListOrder,
    meta: {
      auth: true,
      title: 'List Order',
      roles: ['admin', 'depot'],
    },
  },
  {
    path: '/carts',
    name: 'cart',
    component: Cart,
    meta: {
      auth: true,
      title: 'Cart',
      roles: ['admin', 'depot'],
    },
  },
  {
    path: '/user-points',
    name: 'userPoint',
    component: UserPoint,
    meta: {
      auth: true,
      title: 'User Point',
      roles: ['admin', 'depot', 'dealer'],
    },
  },
  {
    path: '/list-incoming-orders',
    name: 'listIncomingOrder',
    component: ListIncomingOrder,
    meta: {
      auth: true,
      title: 'List Incoming Order',
      roles: ['admin', 'dealer'],
    },
  },
  {
    path: '/list-sale-items',
    name: 'listSaleItem',
    component: ListSaleItem,
    meta: {
      auth: true,
      title: 'List Sale Item',
      roles: ['admin', 'dealer'],
    },
  },

  {
    path: '/item-detail/:catalogId',
    name: 'itemDetail',
    component: ItemDetail,
    meta: {
      auth: true,
      title: 'Item Detail',
      roles: ['admin', 'depot'], //remove dealer
    },
  },
  {
    path: '/item-detail-supplier/:productId',
    name: 'itemDetailSupplier',
    component: ItemDetailSupplier,
    meta: {
      auth: true,
      title: 'Item Detail Supplier',
      roles: ['admin', 'depot'], //remove dealer
    },
  },
  {
    path: '/supplier-storefront/:storeId',
    name: 'supplierStorefront',
    component: SupplierStorefront,
    meta: {
      auth: true,
      title: 'Supplier Storefront',
      roles: ['admin', 'depot'], //remove dealer ?
    },
  },
  {
    path: '/storefront/',
    name: 'storefront',
    component: Storefront,
    meta: {
      auth: true,
      title: 'Storefront',
      roles: ['admin', 'dealer'],
    },
  },
  {
    path: '/order-success',
    name: 'orderSuccess',
    component: OrderSuccess,
    meta: {
      auth: true,
      title: 'Order Success',
      roles: ['admin', 'depot', 'dealer'],
    },
  },
  {
    path: '/order-confirmation/:shoppingCartId',
    name: 'orderConfirmation',
    component: OrderConfirmation,
    meta: {
      auth: true,
      title: 'Order Confirmation',
      roles: ['admin', 'depot'],
    },
  },
  {
    path: '/outcoming-orders/:purchaseOrderId',
    name: 'outcomingOrder',
    component: OutcomingOrder,
    meta: {
      auth: true,
      title: 'Outcoming Order',
      roles: ['admin', 'depot'],
    },
  },

  {
    path: '/incoming-orders/:purchaseOrderId',
    name: 'incomingOrder',
    component: IncomingOrder,
    meta: {
      auth: true,
      title: 'Incoming Order',
      roles: ['admin', 'dealer'],
    },
  },
  {
    path: '/settings',
    name: 'setting',
    component: Setting,
    meta: {
      auth: true,
      title: 'Setting',
      roles: ['admin'],
    },
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
    meta: {
      auth: false,
      title: 'About',
      roles: ['admin', 'depot', 'dealer'],
    },
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      auth: true,
      title: 'Login',
      roles: [],
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: {
      auth: true,
      title: 'Profile',
      roles: ['admin', 'depot', 'dealer'],
    },
  },
  // admin's views router
  {
    path: '/items',
    name: 'item',
    component: Item,
    meta: {
      auth: true,
      title: 'Item',
      roles: ['admin'],
    },
  },
  {
    path: '/users',
    name: 'user',
    component: User,
    meta: {
      auth: true,
      title: 'User',
      roles: ['admin'],
    },
  },
  {
    path: '/dealers',
    name: 'dealer',
    component: Dealer,
    meta: {
      auth: true,
      title: 'Dealer',
      roles: ['admin'],
    },
  },
  {
    path: '/dealer-details/:dealerId',
    name: 'dealerDetail',
    component: DealerDetail,
    meta: {
      auth: true,
      title: 'Dealer Detail',
      roles: ['admin'],
    },
  },
  {
    path: '/depots',
    name: 'depot',
    component: Depot,
    meta: {
      auth: true,
      title: 'Depot',
      roles: ['admin'],
    },
  },
  // {
  //   path: '/roles',
  //   name: 'role',
  //   component: Role,
  //   meta: {
  //     auth: true,
  //     title: 'Role',
  //     roles: ['admin'],
  //   },
  // },
  {
    path: '/promo',
    name: 'promo',
    component: Promo,
    meta: {
      auth: true,
      title: 'Promo',
      roles: ['admin'],
    },
  },
  {
    path: '/featured',
    name: 'featured',
    component: Featured,
    meta: {
      auth: true,
      title: 'Featured',
      roles: ['admin'],
    },
  },
  {
    path: '/report',
    name: 'report',
    component: Report,
    meta: {
      auth: true,
      title: 'Report',
      roles: ['admin'],
    },
  },
  {
    path: '/slides',
    name: 'slide',
    component: Slide,
    meta: {
      auth: true,
      title: 'Slide',
      roles: ['admin'],
    },
  },
  {
    path: '/units',
    name: 'unit',
    component: Unit,
    meta: {
      auth: true,
      title: 'Unit',
      roles: ['admin'],
    },
  },
  {
    path: '/master-products',
    name: 'masterProduct',
    component: MasterProduct,
    meta: {
      auth: true,
      title: 'Master Product',
      roles: ['admin'],
    },
  },
  {
    path: '/products',
    name: 'product',
    component: Product,
    meta: {
      auth: true,
      title: 'Product',
      roles: ['admin'],
    },
  },
  {
    path: '/product-categories',
    name: 'productCategory',
    component: ProductCategory,
    meta: {
      auth: true,
      title: 'Product Category',
      roles: ['admin'],
    },
  },
  {
    path: '/product-brands',
    name: 'productBrand',
    component: ProductBrand,
    meta: {
      auth: true,
      title: 'Product Brand',
      roles: ['admin'],
    },
  },
  {
    path: '/product-images',
    name: 'productImages',
    component: ProductImage,
    meta: {
      auth: true,
      title: 'Product Image',
      roles: ['admin'],
    },
  },
  {
    path: '/purchases',
    name: 'purchase',
    component: Purchase,
    meta: {
      auth: true,
      title: 'Purchase',
      roles: ['admin'],
    },
  },
  {
    path: '/points',
    name: 'point',
    component: Point,
    meta: {
      auth: true,
      title: 'Point',
      roles: ['admin'],
    },
  },
  {
    path: '/purchase-details/:purchaseOrderId',
    name: 'purchaseDetail',
    component: PurchaseDetail,
    meta: {
      auth: true,
      title: 'Purchase Detail',
      roles: ['admin'],
    },
  },
  {
    path: '/purchase-items',
    name: 'purchaseItem',
    component: PurchaseItem,
    meta: {
      auth: true,
      title: 'Purchase Item',
      roles: ['admin'],
    },
  },
  {
    path: '/sales',
    name: 'sale',
    component: Sale,
    meta: {
      auth: true,
      title: 'Sale',
      roles: ['admin'],
    },
  },
  {
    path: '/sale-items',
    name: 'saleItem',
    component: SaleItem,
    meta: {
      auth: true,
      title: 'Sale Item',
      roles: ['admin'],
    },
  },
  {
    path: '/stores',
    name: 'store',
    component: Store,
    meta: {
      auth: true,
      title: 'Store',
      roles: ['admin'],
    },
  },
  {
    path: '/addresses',
    name: 'address',
    component: Address,
    meta: {
      auth: true,
      title: 'Address',
      roles: ['admin'],
    },
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach(async (to, from, next) => {
  const checkToken = await checkTokenExp()

  const currentUser = JSON.parse(localStorage.getItem('currentUser'))

  if (!currentUser) {
    if (!currentUser && to.path == '/login') {
      next()
    } else if (!currentUser && to.path != '/login') {
      next('/login')
    }
  } else {
    const roleName = currentUser.role.name
    const roles = [...to.meta.roles]

    if (!checkToken && to.path == '/login') {
      next()
    }
    if (checkToken && to.path == '/login') {
      next(from.path)
    } else if (checkToken && roles.includes(roleName)) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
