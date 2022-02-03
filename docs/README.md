# profitshare

Open the VTEX App Store and install the app on your store.

or

Run the following command:

```sh
vtex install vtex.profitshare@0.x
```

Next, open the app settings on your admin and fill the form with Cookie conversions, Advertiser tracking code, Encription key and VAT (if the VAT tax is _not_ added in /admin in Promotions -> Taxes). But pay attention, the VAT completed in /admin settings will be applied to all products!

# multiple bindings
Multiple scripts can be setup from app settings based on bindingId
In settings the following property was added:
-"bindingBounded": true
In the admin panel, for the installed application's settings the Enable configuration by binding checkbox should be checked
and most important the Binding Id should be a valid one. There are some other settings which are mandatory.
