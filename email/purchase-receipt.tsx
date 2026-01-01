import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';

type OrderInformationProps = {
  order: Order;
};

const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });

export default function PurchaseReceiptEmail({ order }: OrderInformationProps) {
  return (
    <Html>
      <Preview>Your order is confirmed! 🎉</Preview>
      <Tailwind>
        <Head />
        <Body className='font-sans bg-slate-950 text-slate-50 m-0 py-10'>
          <Container className='max-w-xl mx-auto px-4'>
            {/* Header */}
            <Section className='text-center mb-6'>
              <Img
                src='https://blackcatmacrame-delta.vercel.app/images/logo.png'
                alt='Macrame Black Cat'
                width='120'
                className='mx-auto mb-3'
              />
              <Text className='text-xs uppercase tracking-[0.25em] text-emerald-400 m-0'>
                Order Confirmed
              </Text>
            </Section>

            {/* Main Card */}
            <Section className='bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 rounded-3xl px-8 py-10 shadow-2xl'>
              <div className='text-center mb-4'>
                <Text className='text-4xl m-0'>🛍️</Text>
              </div>
              
              <Heading className='text-3xl font-bold mb-2 text-center text-slate-50'>
                Thank You!
              </Heading>
              
              <Text className='text-sm leading-relaxed text-slate-300 text-center mb-2'>
                Hey {order.user.name}! 👋
              </Text>
              <Text className='text-sm leading-relaxed text-slate-400 text-center mb-8'>
                Your order has been confirmed and is being prepared with love. Here&apos;s your receipt:
              </Text>

              {/* Order Info */}
              <Section className='bg-slate-800/50 rounded-xl p-4 mb-6'>
                <Row>
                  <Column>
                    <Text className='text-[10px] uppercase tracking-wider text-slate-500 m-0 mb-1'>Order ID</Text>
                    <Text className='text-sm font-mono text-emerald-400 m-0'>#{order.id.slice(-8).toUpperCase()}</Text>
                  </Column>
                  <Column>
                    <Text className='text-[10px] uppercase tracking-wider text-slate-500 m-0 mb-1'>Date</Text>
                    <Text className='text-sm text-slate-300 m-0'>{dateFormatter.format(new Date(order.createdAt))}</Text>
                  </Column>
                  <Column>
                    <Text className='text-[10px] uppercase tracking-wider text-slate-500 m-0 mb-1'>Total</Text>
                    <Text className='text-sm font-bold text-emerald-400 m-0'>{formatCurrency(order.totalPrice)}</Text>
                  </Column>
                </Row>
              </Section>

              {/* Order Items */}
              <Section className='border border-slate-700/50 rounded-xl p-4 mb-6'>
                <Text className='text-xs uppercase tracking-wider text-slate-500 mb-4'>Items Ordered</Text>
                {order.orderitems.map((item) => (
                  <Row key={item.productId} className='mb-4'>
                    <Column className='w-16'>
                      <Img
                        width='60'
                        height='60'
                        alt={item.name}
                        className='rounded-lg'
                        src={
                          item.image.startsWith('/')
                            ? `https://blackcatmacrame-delta.vercel.app${item.image}`
                            : item.image
                        }
                      />
                    </Column>
                    <Column className='pl-3'>
                      <Text className='text-sm text-slate-200 m-0 mb-1'>{item.name}</Text>
                      <Text className='text-xs text-slate-500 m-0'>Qty: {item.qty}</Text>
                    </Column>
                    <Column align='right'>
                      <Text className='text-sm font-semibold text-slate-200 m-0'>
                        {formatCurrency(Number(item.price) * item.qty)}
                      </Text>
                    </Column>
                  </Row>
                ))}
                
                {/* Totals */}
                <Section className='border-t border-slate-700/50 pt-4 mt-4'>
                  <Row className='mb-1'>
                    <Column><Text className='text-xs text-slate-400 m-0'>Subtotal</Text></Column>
                    <Column align='right'><Text className='text-xs text-slate-300 m-0'>{formatCurrency(order.itemsPrice)}</Text></Column>
                  </Row>
                  <Row className='mb-1'>
                    <Column><Text className='text-xs text-slate-400 m-0'>Shipping</Text></Column>
                    <Column align='right'><Text className='text-xs text-slate-300 m-0'>{formatCurrency(order.shippingPrice)}</Text></Column>
                  </Row>
                  <Row className='mb-1'>
                    <Column><Text className='text-xs text-slate-400 m-0'>Tax</Text></Column>
                    <Column align='right'><Text className='text-xs text-slate-300 m-0'>{formatCurrency(order.taxPrice)}</Text></Column>
                  </Row>
                  <Row className='mt-3 pt-3 border-t border-slate-700/50'>
                    <Column><Text className='text-sm font-bold text-slate-200 m-0'>Total</Text></Column>
                    <Column align='right'><Text className='text-sm font-bold text-emerald-400 m-0'>{formatCurrency(order.totalPrice)}</Text></Column>
                  </Row>
                </Section>
              </Section>

              {/* Shipping Address */}
              <Section className='bg-slate-800/30 rounded-xl p-4'>
                <Text className='text-xs uppercase tracking-wider text-slate-500 mb-2'>Shipping To</Text>
                <Text className='text-sm text-slate-300 m-0'>
                  {order.shippingAddress.fullName}<br />
                  {order.shippingAddress.streetAddress}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section className='mt-8 text-center'>
              <Text className='text-xs text-slate-400 mb-4'>
                Questions about your order? Just reply to this email!
              </Text>
              <Text className='text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-1'>
                Macrame Black Cat
              </Text>
              <Text className='text-[10px] text-slate-700'>
                Handcrafted with love & intention ✨
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
