'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ApiTestPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Test data for mobile order
    const [testData, setTestData] = useState({
        customerEmail: 'test@mobile.com',
        deliveryAddress: '123 Test Street',
        deliveryCity: 'Test City',
        customerNotes: 'Test order from dashboard',
        totalAmount: 25.50,
        orderItems: [
            {
                productName: 'Corona Beer',
                quantity: 2,
                price: 5.50,
                imageUrl: 'assets/beers/corona.jpg'
            },
            {
                productName: 'Classic Pizza',
                quantity: 1,
                price: 14.50,
                imageUrl: 'assets/foods/pizza.jpg'
            }
        ]
    });

    const testMobileOrderAPI = async () => {
        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            const orderNumber = `TEST-${Date.now()}`;

            const payload = {
                orderNumber,
                customerEmail: testData.customerEmail,
                totalAmount: testData.totalAmount,
                deliveryAddress: testData.deliveryAddress,
                deliveryCity: testData.deliveryCity,
                customerNotes: testData.customerNotes,
                adminNotes: `Test order created from dashboard at ${new Date().toISOString()}`,
                orderItems: testData.orderItems,
            };

            console.log('🔥 TESTING MOBILE API');
            console.log('📡 URL:', '/api/orders/mobile');
            console.log('📦 Payload:', JSON.stringify(payload, null, 2));

            const response = await fetch('/api/orders/mobile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Email': testData.customerEmail,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            console.log('📥 Response Status:', response.status);
            console.log('📄 Response Data:', data);

            if (response.ok) {
                setResponse({
                    status: response.status,
                    data: data,
                    success: true
                });
            } else {
                setError(`API Error: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Network error';
            setError(errorMsg);
            console.error('🚫 Test Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const testGetOrdersAPI = async () => {
        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            console.log('🔥 TESTING GET ORDERS API');
            console.log('📡 URL:', '/api/orders');

            const response = await fetch('/api/orders');
            const data = await response.json();

            console.log('📥 Response Status:', response.status);
            console.log('📄 Response Data:', data);

            if (response.ok) {
                setResponse({
                    status: response.status,
                    data: data,
                    success: true
                });
            } else {
                setError(`API Error: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Network error';
            setError(errorMsg);
            console.error('🚫 Test Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const testMobileOrdersAPI = async () => {
        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            console.log('🔥 TESTING MOBILE ORDERS GET API');
            console.log('📡 URL:', '/api/orders/mobile');

            const response = await fetch('/api/orders/mobile');
            const data = await response.json();

            console.log('📥 Response Status:', response.status);
            console.log('📄 Response Data:', data);

            if (response.ok) {
                setResponse({
                    status: response.status,
                    data: data,
                    success: true
                });
            } else {
                setError(`API Error: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Network error';
            setError(errorMsg);
            console.error('🚫 Test Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const testMobileStatsAPI = async () => {
        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            console.log('🔥 TESTING MOBILE STATS API');
            console.log('📡 URL:', '/api/orders/mobile/stats');

            const response = await fetch('/api/orders/mobile/stats');
            const data = await response.json();

            console.log('📥 Response Status:', response.status);
            console.log('📄 Response Data:', data);

            if (response.ok) {
                setResponse({
                    status: response.status,
                    data: data,
                    success: true
                });
            } else {
                setError(`API Error: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Network error';
            setError(errorMsg);
            console.error('🚫 Test Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const testCompleteFlowAPI = async () => {
        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            const response = await fetch('/api/orders/mobile/test-complete-flow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const data = await response.json();

            if (response.ok) {
                setResponse({ status: response.status, data: data, success: true });
            } else {
                setError(`API Error: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Network error';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const testCheckoutSimulationAPI = async () => {
        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            const checkoutData = {
                userEmail: testData.customerEmail,
                cartItems: testData.orderItems.map(item => ({
                    name: item.productName,
                    price: item.price,
                    qty: item.quantity,
                    imageUrl: item.imageUrl
                }))
            };

            const response = await fetch('/api/orders/mobile/simulate-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(checkoutData)
            });
            const data = await response.json();

            if (response.ok) {
                setResponse({ status: response.status, data: data, success: true });
            } else {
                setError(`API Error: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Network error';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">🧪 API Testing Dashboard</h1>
                <p className="text-muted-foreground">Test mobile API endpoints directly from the browser</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle>📝 Test Configuration</CardTitle>
                        <CardDescription>Configure the test data for mobile orders</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="email">Customer Email</Label>
                            <Input
                                id="email"
                                value={testData.customerEmail}
                                onChange={(e) => setTestData({ ...testData, customerEmail: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="address">Delivery Address</Label>
                            <Input
                                id="address"
                                value={testData.deliveryAddress}
                                onChange={(e) => setTestData({ ...testData, deliveryAddress: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="total">Total Amount</Label>
                            <Input
                                id="total"
                                type="number"
                                step="0.01"
                                value={testData.totalAmount}
                                onChange={(e) => setTestData({ ...testData, totalAmount: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="notes">Customer Notes</Label>
                            <Textarea
                                id="notes"
                                value={testData.customerNotes}
                                onChange={(e) => setTestData({ ...testData, customerNotes: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Test Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>🚀 API Tests</CardTitle>
                        <CardDescription>Test different API endpoints</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={testMobileOrderAPI}
                            disabled={isLoading}
                            className="w-full"
                            variant="default"
                        >
                            {isLoading ? '⏳ Testing...' : '📱 Test Mobile Order Creation'}
                        </Button>

                        <Button
                            onClick={testGetOrdersAPI}
                            disabled={isLoading}
                            className="w-full"
                            variant="outline"
                        >
                            {isLoading ? '⏳ Testing...' : '📋 Test Get Orders (Admin)'}
                        </Button>

                        <Button
                            onClick={testMobileOrdersAPI}
                            disabled={isLoading}
                            className="w-full"
                            variant="secondary"
                        >
                            {isLoading ? '⏳ Testing...' : '📱 Get Mobile Orders (DB)'}
                        </Button>

                        <Button
                            onClick={testMobileStatsAPI}
                            disabled={isLoading}
                            className="w-full"
                            variant="secondary"
                        >
                            {isLoading ? '⏳ Testing...' : '📊 Get Order Statistics'}
                        </Button>

                        <hr className="my-4" />
                        <p className="text-sm font-semibold text-center">🧪 Complete Flow Tests</p>

                        <Button
                            onClick={testCompleteFlowAPI}
                            disabled={isLoading}
                            className="w-full"
                            variant="destructive"
                        >
                            {isLoading ? '⏳ Testing...' : '🔥 Test Complete Mobile Flow'}
                        </Button>

                        <Button
                            onClick={testCheckoutSimulationAPI}
                            disabled={isLoading}
                            className="w-full"
                            variant="destructive"
                        >
                            {isLoading ? '⏳ Testing...' : '🛒 Simulate Mobile Checkout'}
                        </Button>

                        <div className="text-sm text-muted-foreground">
                            <p><strong>📱 Mobile API (POST):</strong> http://localhost:3000/api/orders/mobile</p>
                            <p><strong>📱 Mobile Orders (GET):</strong> http://localhost:3000/api/orders/mobile</p>
                            <p><strong>📊 Mobile Stats:</strong> http://localhost:3000/api/orders/mobile/stats</p>
                            <p><strong>📋 Admin Orders:</strong> http://localhost:3000/api/orders</p>
                            <p><strong>🔥 Complete Flow:</strong> http://localhost:3000/api/orders/mobile/test-complete-flow</p>
                            <p><strong>🛒 Checkout Sim:</strong> http://localhost:3000/api/orders/mobile/simulate-checkout</p>
                            <p><strong>🤖 For Android Emulator:</strong> http://10.0.2.2:3000/api/orders/mobile</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Response Display */}
            {(response || error) && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {error ? '❌ Error Response' : '✅ Success Response'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded p-4">
                                <pre className="text-red-800 whitespace-pre-wrap">{error}</pre>
                            </div>
                        )}
                        {response && (
                            <div className="bg-green-50 border border-green-200 rounded p-4">
                                <p className="font-semibold text-green-800 mb-2">
                                    Status: {response.status} {response.success ? '✅' : '❌'}
                                </p>
                                <pre className="text-green-800 whitespace-pre-wrap text-sm">
                                    {JSON.stringify(response.data, null, 2)}
                                </pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Expected Mobile App Payload */}
            <Card>
                <CardHeader>
                    <CardTitle>📱 Expected Mobile App Payload</CardTitle>
                    <CardDescription>This is the data format the mobile app sends</CardDescription>
                </CardHeader>
                <CardContent>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                        {JSON.stringify({
                            orderNumber: "MOB-1727634567890",
                            customerEmail: testData.customerEmail,
                            totalAmount: testData.totalAmount,
                            deliveryAddress: testData.deliveryAddress,
                            deliveryCity: testData.deliveryCity,
                            customerNotes: testData.customerNotes,
                            adminNotes: "Order created from mobile app",
                            orderItems: testData.orderItems
                        }, null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}