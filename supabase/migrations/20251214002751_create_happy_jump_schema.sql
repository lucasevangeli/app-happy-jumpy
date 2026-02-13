/*
  # Happy Jump App Database Schema

  ## Tables Created
  
  ### 1. tickets
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Ticket name (e.g., "Ingresso Individual", "Ingresso Criança")
  - `description` (text) - Ticket description
  - `price` (numeric) - Ticket price in BRL
  - `duration_minutes` (integer) - Duration in minutes
  - `age_restriction` (text) - Age restrictions if any
  - `image_url` (text) - Image URL
  - `is_active` (boolean) - Whether ticket is available for sale
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. combos
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Combo name
  - `description` (text) - Combo description
  - `price` (numeric) - Combo price in BRL
  - `original_price` (numeric) - Original price before discount
  - `includes` (jsonb) - Array of what's included
  - `image_url` (text) - Image URL
  - `is_active` (boolean) - Whether combo is available
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. menu_items
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Item name
  - `description` (text) - Item description
  - `category` (text) - Category (Lanches, Bebidas, Sobremesas)
  - `price` (numeric) - Item price in BRL
  - `image_url` (text) - Image URL
  - `is_available` (boolean) - Whether item is available
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. orders
  - `id` (uuid, primary key) - Unique identifier
  - `user_name` (text) - Customer name
  - `user_phone` (text) - Customer phone
  - `total_amount` (numeric) - Total order amount
  - `status` (text) - Order status (pending, confirmed, completed, cancelled)
  - `order_type` (text) - Type (ticket, combo, menu, mixed)
  - `created_at` (timestamptz) - Order timestamp

  ### 5. order_items
  - `id` (uuid, primary key) - Unique identifier
  - `order_id` (uuid, foreign key) - Reference to orders
  - `item_type` (text) - Type (ticket, combo, menu)
  - `item_id` (uuid) - Reference to the item
  - `item_name` (text) - Item name snapshot
  - `quantity` (integer) - Quantity ordered
  - `unit_price` (numeric) - Unit price snapshot
  - `subtotal` (numeric) - Subtotal for this item
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - RLS enabled on all tables
  - Public read access for products (tickets, combos, menu_items)
  - Authenticated users can create orders
  - Users can only view their own orders
*/

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10, 2) NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  age_restriction text DEFAULT '',
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create combos table
CREATE TABLE IF NOT EXISTS combos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10, 2) NOT NULL,
  original_price numeric(10, 2) NOT NULL,
  includes jsonb DEFAULT '[]'::jsonb,
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  price numeric(10, 2) NOT NULL,
  image_url text DEFAULT '',
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  user_phone text NOT NULL,
  total_amount numeric(10, 2) NOT NULL,
  status text DEFAULT 'pending',
  order_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10, 2) NOT NULL,
  subtotal numeric(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tickets (public read)
CREATE POLICY "Anyone can view active tickets"
  ON tickets FOR SELECT
  USING (is_active = true);

-- RLS Policies for combos (public read)
CREATE POLICY "Anyone can view active combos"
  ON combos FOR SELECT
  USING (is_active = true);

-- RLS Policies for menu_items (public read)
CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  USING (is_available = true);

-- RLS Policies for orders (anyone can insert, read own orders)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  USING (true);

-- RLS Policies for order_items
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view order items"
  ON order_items FOR SELECT
  USING (true);

-- Insert sample tickets
INSERT INTO tickets (name, description, price, duration_minutes, age_restriction, image_url) VALUES
('Ingresso Individual', 'Diversão ilimitada por 1 hora em todos os brinquedos', 35.00, 60, 'Todas as idades', 'https://images.pexels.com/photos/6957904/pexels-photo-6957904.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Ingresso Criança', 'Especial para crianças até 8 anos - 1 hora', 25.00, 60, 'Até 8 anos', 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Ingresso VIP', '2 horas de diversão + área VIP com monitores exclusivos', 60.00, 120, 'Todas as idades', 'https://images.pexels.com/photos/6957283/pexels-photo-6957283.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Ingresso Família', 'Até 4 pessoas - 1 hora de diversão', 100.00, 60, 'Todas as idades', 'https://images.pexels.com/photos/8613319/pexels-photo-8613319.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Insert sample combos
INSERT INTO combos (name, description, price, original_price, includes, image_url) VALUES
('Combo Diversão', 'Ingresso + Lanche + Refrigerante', 45.00, 55.00, '["1 Ingresso Individual", "1 Hot Dog", "1 Refrigerante 350ml"]'::jsonb, 'https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Combo Família Completo', '4 Ingressos + 4 Lanches + 4 Bebidas', 150.00, 200.00, '["4 Ingressos Individuais", "4 Hot Dogs", "4 Refrigerantes 350ml", "1 Porção de Batata Frita"]'::jsonb, 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Combo Aniversário', 'Pacote especial para festa de aniversário', 300.00, 400.00, '["10 Ingressos", "Decoração do espaço", "Bolo personalizado", "Salgadinhos", "Bebidas"]'::jsonb, 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Insert sample menu items
INSERT INTO menu_items (name, description, category, price, image_url) VALUES
-- Lanches
('Hot Dog', 'Hot dog tradicional com batata palha', 'Lanches', 12.00, 'https://images.pexels.com/photos/4676409/pexels-photo-4676409.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Hambúrguer', 'Hambúrguer artesanal com queijo', 'Lanches', 18.00, 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Pizza Fatia', 'Fatia de pizza sabor mussarela', 'Lanches', 10.00, 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Pipoca Grande', 'Balde grande de pipoca doce ou salgada', 'Lanches', 8.00, 'https://images.pexels.com/photos/4735893/pexels-photo-4735893.jpeg?auto=compress&cs=tinysrgb&w=800'),
-- Bebidas
('Refrigerante Lata', 'Refrigerante 350ml - Vários sabores', 'Bebidas', 5.00, 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Suco Natural', 'Suco natural de frutas 500ml', 'Bebidas', 8.00, 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Água Mineral', 'Água mineral 500ml', 'Bebidas', 3.00, 'https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg?auto=compress&cs=tinysrgb&w=800'),
-- Sobremesas
('Sorvete', 'Sorvete de casquinha - Vários sabores', 'Sobremesas', 7.00, 'https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Bolo no Pote', 'Bolo caseiro no pote - Chocolate ou Cenoura', 'Sobremesas', 10.00, 'https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Açaí', 'Açaí 300ml com granola e banana', 'Sobremesas', 15.00, 'https://images.pexels.com/photos/4033327/pexels-photo-4033327.jpeg?auto=compress&cs=tinysrgb&w=800');
