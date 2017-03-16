# Chapter 1 

Here are the code examples from Chapter 1.

## Figure 1.11
LED Screen with code:
```blocks
basic.showIcon(IconNames.Square)
led.plot(2, 2)
```

## Figure 1.12.

Take action on button A/B pressed.
```blocks
input.onButtonPressed(Button.A, () => {
    basic.showIcon(IconNames.Square)
})
input.onButtonPressed(Button.B, () => {
    led.plot(2, 2)
})
```

## Figure 1.13.

Take action on button A/B pressed, as
well as shaking the micro:bit.
```blocks
input.onButtonPressed(Button.A, () => {
    basic.showIcon(IconNames.Square)
})
input.onButtonPressed(Button.B, () => {
    led.plot(2, 2)
})
input.onGesture(Gesture.Shake, () => {
    basic.clearScreen()
}) 
```

