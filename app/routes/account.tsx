import {
  data as remixData,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {Form, NavLink, Outlet, useLoaderData} from '@remix-run/react';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: LoaderFunctionArgs) {
  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_DETAILS_QUERY,
  );

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}`
      : `Welcome to your account.`
    : 'Account Details';

  return (
    <div className="account">
      <div className="account-container">
        <h1>{heading}</h1>
        <AccountMenu />
        <div className="account-content">
          <Outlet context={{customer}} />
        </div>
      </div>
    </div>
  );
}

function AccountMenu() {
  function isActiveStyle({
    isActive,
    isPending,
  }: {
    isActive: boolean;
    isPending: boolean;
  }) {
    return {
      fontWeight: isActive ? 'bold' : undefined,
      color: isPending ? 'grey' : 'black',
    };
  }

  return (
    <nav role="navigation" className="account-menu">
      <NavLink to="/account/orders" style={isActiveStyle}>
        Orders
      </NavLink>
      <span className="nav-divider">|</span>
      <NavLink to="/account/profile" style={isActiveStyle}>
        Profile
      </NavLink>
      <span className="nav-divider">|</span>
      <NavLink to="/account/addresses" style={isActiveStyle}>
        Addresses
      </NavLink>
      <span className="nav-divider">|</span>
      <Logout />
    </nav>
  );
}

function Logout() {
  return (
    <Form className="account-logout" method="POST" action="/account/logout">
      <button type="submit">Sign out</button>
    </Form>
  );
}
