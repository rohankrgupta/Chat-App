const socket = io()

// Elements
const $messageForm = document.querySelector('#msg-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormBtn = $messageForm.querySelector('button')
const $locationBtn = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = ()=>{
    
    // new message element
    const $newMessage = $messages.lastElementChild

    // Height of new messsage
    const newMsgStyles = getComputedStyle($newMessage)
    const newMsgMargin = parseInt(newMsgStyles.marginBottom)
    const newMsgHeight = $newMessage.offsetHeight + newMsgMargin
    
    // visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerheight = $messages.scrollHeight

    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerheight - newMsgHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('Message', (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment( message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (url)=>{
    console.log(url)
    const html = Mustache.render(locationTemplate, {
        username: url.username,
        url: url.text,
        createdAt: moment(url.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sideBarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    
    $messageFormBtn.setAttribute('disabled', 'disabled')

    const msg = $messageFormInput.value
    
    socket.emit('sendMsg', msg, (error)=>{
       $messageFormBtn.removeAttribute('disabled')
       $messageFormInput.value = ''
       $messageFormInput.focus()
        if(error){
           return console.log(error)
       }
       console.log('Message delivered !')
    })
})

$locationBtn.addEventListener('click', ()=>{
    
    if(!navigator.geolocation)
        return alert('Geolocation is not supported by your browser')
    
    $locationBtn.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=>{
            $locationBtn.removeAttribute('disabled')
            console.log('Location shared !')
        })
    })
})

socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

