import { environment } from './../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Luv2ShopFormService } from '../../services/luv2ShopForm.service';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { Luv2ShopValidators } from '../../validators/Luv2ShopValidators';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/orderItem';
import { Purchase } from '../../common/purchase';
import { PaymentInfo } from '../../common/payment-info';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  standalone: false
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup

  totalPrice: number = 0
  totalQuantity: number = 0

  creditCardYears: number[] = []
  creditCardMonths: number[] = []

  countries: Country[] = []

  shippingAddressStates: State[] = []
  billingAddressStates: State[] = []

  storage: Storage = sessionStorage

  stripe = Stripe(environment.stripePublishableKey)

  paymentInfo: PaymentInfo = new PaymentInfo()
  cardElement: any
  displayError: any = ''

  isDisabled: boolean = false

  constructor(private formBuilder: FormBuilder,
    private luv2ShopFormService: Luv2ShopFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) { }

  ngOnInit() {

    this.setupStripePaymentForm()

    this.reviewCartDetails()

    const theEmail = JSON.parse(this.storage.getItem('userEmail')!)

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        email: new FormControl(theEmail, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{4}-[0-9]{3}$')])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{4}-[0-9]{3}$')])
      }),
      creditCard: this.formBuilder.group({
        // cardType: new FormControl('', [Validators.required]),
        // nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhiteSpace]),
        // cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        // securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        // expirationMonth: [''],
        // expirationYear: ['']


      })
    })

                  //preencher automaticamente o Credit Card
    // const startMonth: number = new Date().getMonth() + 1
    // console.log('StartMonth: ' + startMonth)

    // this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
    //   data => {
    //     console.log("Retrieved credit card Months: " + JSON.stringify(data))
    //     this.creditCardMonths = data
    //   }
    // )

    // this.luv2ShopFormService.getCreditCardYears().subscribe(
    //   data => {
    //     console.log("Retrieved credit card Years: " + JSON.stringify(data))
    //     this.creditCardYears = data
    //   }
    // )

    this.luv2ShopFormService.getCountries().subscribe(
      data => {
        console.log("Retrieved countries: " + JSON.stringify(data))
        this.countries = data
      }
    )
  }

  setupStripePaymentForm() {
    const elements = this.stripe.elements()
    this.cardElement = elements.create('card', {hidePostalCode: true})
    this.cardElement.mount('#card-element')

    this.cardElement.on('change', (event: any) => {
      this.displayError = document.getElementById('card-errors')

      if(event.complete) {
        this.displayError.textContent = ''
      }else if(event.error) {
        this.displayError.textContent = event.error.message
      }else {
        this.displayError.textContent = ''
      }
    })
  }

  reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    )
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    )
  }

  onSubmit() {
    console.log('Handling the submit button')

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched()
      return
    }

    let order = new Order
    order.totalPrice = this.totalPrice
    order.totalQuantity = this.totalQuantity

    const cartItems = this.cartService.cartItems

    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem))

    let purchase = new Purchase()

    purchase.customer = this.checkoutFormGroup.controls['customer'].value

    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value
    if (purchase.shippingAddress) {
      const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
      const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));

      if (shippingState && shippingState.name) {
        purchase.shippingAddress.state = shippingState.name;
      }
      if (shippingCountry && shippingCountry.name) {
        purchase.shippingAddress.country = shippingCountry.name;
      }
    }

    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value
    //Dá erro e foi substituido pelo codigo abaixo
    // const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress?.state))
    // const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress?.country))
    // purchase.billingAddress.state = billingState.name
    // purchase.billingAddress.country = billingCountry.name
    if (purchase.billingAddress) {
      const shippingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
      const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));

      if (shippingState && shippingState.name) {
        purchase.billingAddress.state = shippingState.name;
      }
      if (shippingCountry && shippingCountry.name) {
        purchase.billingAddress.country = shippingCountry.name;
      }
    }

    purchase.order = order
    purchase.orderItems = orderItems

    this.paymentInfo.amount = Math.round(this.totalPrice * 100)
    this.paymentInfo.currency = 'EUR'
    this.paymentInfo.receiptEmail = purchase.customer?.email ?? ''

    console.log(`paymentInfo.amount: ${this.paymentInfo.amount}`)

    // this.checkoutService.placeOrder(purchase).subscribe({
    //   next: response => {
    //     //console.log(response)
    //     alert(`Your order has been received. \nOrder tracking number: ${response.orderTrackingNumber}`)
    //     this.resetCart()
    //   },
    //   error: err => {
    //     alert(`There was an error: ${err.message}`)
    //   }
    // })

    if(!this.checkoutFormGroup.invalid && this.displayError.textContent === "") {

      this.isDisabled = true

      this.checkoutService.createPaymentInfo(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement,
                billing_details: {
                  email: purchase.customer?.email,
                  name: `${purchase.customer?.firstName} ${purchase.customer?.lastName}`,
                  address: {
                    line1: purchase.billingAddress?.street,
                    city: purchase.billingAddress?.city,
                    state: purchase.billingAddress?.state,
                    postal_code: purchase.billingAddress?.zipCode,
                    country: this.billingAddressCountry?.value.code
                  }
                }
              }
            }, {handleActions: false})
            .then((result: any) => {
              if(result.error) {
                alert(`There was an error: ${result.error.message}`)
                this.isDisabled = false
              } else {
                this.checkoutService.placeOrder(purchase).subscribe({
                  next: (response: any) => {
                    alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`)

                    this.resetCart()
                    this.isDisabled = false
                  },
                  error: (err: any) => {
                    alert(`There was an error: ${err.message}`)
                    this.isDisabled = false
                  }
                })
              }
            })
        })
    }else {
      this.checkoutFormGroup.markAllAsTouched()
      return
    }

    // console.log(this.checkoutFormGroup.get('customer')?.value)
    // console.log('The Email address is: ' + this.checkoutFormGroup.get('customer')?.value.email)

    // console.log('The shipping address country is: ' + this.checkoutFormGroup.get('shippingAdress')?.value.coutry.name)
    // console.log('The shipping address state is: ' + this.checkoutFormGroup.get('shippingAdress')?.value.state.name)
  }

  resetCart() {
    this.cartService.cartItems = []
    this.cartService.totalPrice.next(0)
    this.cartService.totalQuantity.next(0)
    this.cartService.persistCartItems()

    this.checkoutFormGroup.reset()

    this.router.navigateByUrl("/products")
  }

  copyShippingAddressToBillingAddress(event: Event) {
    const checkBox = event.target as HTMLInputElement

    if (checkBox.checked) {
      this.checkoutFormGroup.controls['billingAddress']
        .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      this.billingAddressStates = this.shippingAddressStates
    }
    else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = []
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard')
    const currentYear: number = new Date().getFullYear()
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear)

    let startMonth: number
    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1
    } else {
      startMonth = 1
    }
    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card Months: " + JSON.stringify(data));
        this.creditCardMonths = data
      }
    )
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName)
    const countryCode = formGroup?.value.country.code
    const countryName = formGroup?.value.country.name

    console.log(`${formGroupName} country code: ${countryCode}`)
    console.log(`${formGroupName} country name: ${countryName}`)

    this.luv2ShopFormService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data
        } else {
          this.billingAddressStates = data
        }
        formGroup?.get('state')?.setValue(data[0])
      }
    )
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName') }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName') }
  get email() { return this.checkoutFormGroup.get('customer.email') }

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street') }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city') }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state') }
  get shippingAddressZipCpde() { return this.checkoutFormGroup.get('shippingAddress.zipCode') }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country') }

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street') }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city') }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state') }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode') }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country') }

  get creditCardCardType() { return this.checkoutFormGroup.get('creditCard.cardType') }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard') }
  get creditCardCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber') }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode') }


  onZipCodeInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');

  if (value.length > 4) {
    value = value.slice(0, 4) + '-' + value.slice(4);
  }

  this.shippingAddressZipCpde?.setValue(value, { emitEvent: false });
  }
}
