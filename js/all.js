;(function(){
    let roomsInfo = []
    const imageArray = []

    const fetchInfo = {
        headers: {
            'Authorization': `Bearer ${keys.hexSchool_key}`
        }
    }

    const transitionFromLoadingToLoaded = () => {
        document.querySelector('.loading').style.opacity = '0';
        document.querySelector('.loading').style.zIndex = '-999';
        document.querySelector('body').style.overflow = "auto";
        document.querySelector('body').style.overflowX = "hidden";
        document.querySelector('body .container').style.opacity = "1";
    }

    //get All Rooms
    const getRooms = async (url, params) => {
        try {  
            const response = await fetch(url, params)
            const data = await response.json()
            return data;
        } catch(e){
            console.log('getRooms failed', e)
        }
    }
    const assignRooms = async () => {
        const data = await getRooms('https://challenge.thef2e.com/api/thef2e2019/stage6/rooms', fetchInfo);
        roomsInfo = [...data.items]
        return new Promise((resolve,reject) => {
            roomsInfo.length > 0 ? resolve(roomsInfo) : reject('fetch error')
        })
        
    }

    const appendRooms = async () => {
        const info = await assignRooms()
        document.querySelectorAll('.roomlist__item').forEach((item, index) => {
            item.dataset.roomId = info[index].id
            item.href = `./room.html?${info[index].id}`
        })

        setBackground()
        transitionFromLoadingToLoaded()
    }

    const setBackground = () => {
        document.querySelector('.home__cover').style.background = `url(${roomsInfo[3].imageUrl}) center center / 100% 100% no-repeat`
    }

    const appendItemsRoomsPage = async () => {
        await assignRooms()
        const parent = document.querySelector('.rooms__main__items');
        roomsInfo.forEach(room => {
            parent.innerHTML += 
            `<a href="./room.html?${room.id}" class="rooms__main__item">
                <img src=${room.imageUrl} alt="">
                <div class="main__item__desc">
                    <h3>${room.name}</h3>
                    <p style="opacity: 0">no chinese name</p>
                    <p>NT.${room.normalDayPrice} <span> 平日 </span> <span> NT.${room.holidayPrice} 假日</span></p>
                </div>
            </a>`

            imageArray.push(room.imageUrl) //make array for background photos
        })
        setBackgroundRoomsPage()
        transitionFromLoadingToLoaded()
    }

    const setBackgroundRoomsPage = () => {
        document.querySelector('.rooms__banner').style.background = `url(${imageArray[Math.floor(Math.random() * imageArray.length)]}) center center / 100% 100% no-repeat`
        setInterval(() => {
            document.querySelector('.rooms__banner').style.background = `url(${imageArray[Math.floor(Math.random() * imageArray.length)]}) center center / 100% 100% no-repeat`
        }, 2000)
    }


    // get single room
    let singleRoomInfo = {};

    const id = window.location.search.slice(1);
    const getSingleRoom = async () => {
        try {
            const data = await getRooms(`https://challenge.thef2e.com/api/thef2e2019/stage6/room/${id}`, fetchInfo)
            singleRoomInfo = data.room[0];
            return new Promise((resolve, reject) => {
                resolve()
            })
        } catch (e){
            console.error(e)
        }
    }

    const appendSingleRoom = async () => {
        await getSingleRoom()
        document.querySelector('.room__left__main h2').textContent = singleRoomInfo.name
        singleRoomInfo.descriptionShort.GuestMax > 1 ? document.querySelector('.room__left__main ul').innerHTML = 
        
            `<li>房客人數限制： <span>${singleRoomInfo.descriptionShort.GuestMin}~${singleRoomInfo.descriptionShort.GuestMax} 人</span></li>
            <li>床型：<span>${singleRoomInfo.descriptionShort.Bed[0]}</span></li>
            <li>衛浴數量： <span>${singleRoomInfo.descriptionShort["Private-Bath"]}</span> 間</li>
            <li>房間大小： <span>${singleRoomInfo.descriptionShort.Footage}</span> 平方公尺</li>` :

            document.querySelector('.room__left__main ul').innerHTML = 
        
            `<li>房客人數限制： <span>${singleRoomInfo.descriptionShort.GuestMin} 人</span></li>
            <li>床型：<span>${singleRoomInfo.descriptionShort.Bed[0]}</span></li>
            <li>衛浴數量： <span>${singleRoomInfo.descriptionShort["Private-Bath"]}</span> 間</li>
            <li>房間大小： <span>${singleRoomInfo.descriptionShort.Footage}</span> 平方公尺</li>`

        document.querySelector('.room__left__main p').textContent = singleRoomInfo.description
        document.querySelectorAll('.check-time')[0].textContent = `${singleRoomInfo.checkInAndOut.checkInEarly} — ${singleRoomInfo.checkInAndOut.checkInLate}`
        document.querySelectorAll('.check-time')[1].textContent = singleRoomInfo.checkInAndOut.checkOut
        document.querySelectorAll('.left__main__list__item').forEach(item => {
            singleRoomInfo.amenities[item.dataset.id] && item.classList.add('left__main__list__item--active')
        })
        document.querySelectorAll('.room-price')[0].textContent = `NT.${singleRoomInfo.normalDayPrice}`
        document.querySelectorAll('.room-price')[1].textContent = `NT.${singleRoomInfo.holidayPrice}`

        let roomBannerHtml = ""
        singleRoomInfo.imageUrl.forEach(item => roomBannerHtml += `<img class="room__banner__img" src="${item}" alt="">`)
        roomBannerHtml += `<a class="banner__logo" href="./index.html">White Space</a>`
        document.querySelector('.room__banner').innerHTML = roomBannerHtml;

        document.querySelectorAll('.slideshow__item img').forEach((item, index) => item.src = singleRoomInfo.imageUrl[index])
        document.querySelectorAll('.caption__name').forEach(item => item.textContent = singleRoomInfo.name)

        transitionFromLoadingToLoaded()
    }
    
    //slideshow
    let slideIndex = 0;

    const showSlide = (n) => {
        const slides = document.querySelectorAll('.slideshow__item')
        if(n >= slides.length){
            slideIndex = 0;
        }
        if(n < 0){
            slideIndex = slides.length - 1;
        }
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.opacity = "0";
        }
        slides[slideIndex].style.opacity = "1";
    }

    

    //calculate total
    let booking = {
        name: "",
        phone: "",
        startDate: "",
        endDate: "",
        dates: [],
        total: 0
    }

    const reserveRoom = async () => {
        const reservationInfo = {
            name: booking.name,
            tel: booking.phone,
            date: booking.dates
        }
        const fetchInfo = {
            method: 'POST',
            body: JSON.stringify(reservationInfo),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${keys.hexSchool_key}`
            }
        }
        try{
            const response = await fetch(`https://challenge.thef2e.com/api/thef2e2019/stage6/room/${id}`, fetchInfo)
            const data = await response.json()
            return [response.ok, data];
        } catch(e){
            console.log(e)
        }
    }

    const getDatesBetween = (startDate, endDate) => {
        let result = []
        let currentDate = startDate
        while(currentDate < endDate){ //dont count the last day (checkout day)
            result.push(new Date(currentDate))
            booking.dates.push(new Date(currentDate).toISOString().split("T")[0])
            currentDate = moment(currentDate).add(1, 'days');
        }
        return result
    }

    const findWeekend = (date) => {
        let day = date.getDay()
        return day === 0 || day === 6
    }

    const calculateTotal = () => {
        const dates = getDatesBetween(booking.startDate, booking.endDate)
        const weekDaysAndWeekends = dates.reduce((total, current) => {
            findWeekend(current) ? total.weekends++ : total.weekDays++
            return total
        },{ weekDays: 0, weekends: 0})
        
        booking.total = weekDaysAndWeekends.weekDays * singleRoomInfo.normalDayPrice + 
        weekDaysAndWeekends.weekends * singleRoomInfo.holidayPrice

        return weekDaysAndWeekends
    }

    const updateTotal = (dates) => {
        const { weekDays, weekends } = dates;
        booking.total > 0 ? 
        document.querySelector('.modal__price').innerHTML = `= NT.${Math.abs(booking.total)}` : 
        document.querySelector('.modal__price').innerHTML = `= NT.0`

        document.querySelectorAll('.input-days')[0].textContent = `${weekDays}夜`
        document.querySelectorAll('.input-days')[1].textContent = `${weekends}夜`
    }

    const timeHelper = (milli) => {
        let minutes = Math.floor(milli / 60000);
        let hours = Math.round(minutes / 60);
        let days = Math.round(hours / 24);
        return days;
    }

    const dateWithin90 = () => {
        return Math.abs(timeHelper(booking.startDate - new Date())) < 90
    }

    const runDatePicker = () => {
        $(".datepicker").datepicker({
            minDate: 1,
            onSelect: function (dateText, inst) {
                booking.startDate = new Date(dateText)
                const dates = calculateTotal()
                updateTotal(dates)
            }
        });
        $(".datepicker2").datepicker({
            minDate: 1,
            onSelect: function (dateText, inst) {
                booking.endDate = new Date(dateText)
                const dates = calculateTotal()
                updateTotal(dates)
            }
        });
    };

    //modals
    const showSuccessModal = () => {
        document.querySelector('#toggle_success').checked = true;
    }

    const showFailModal = (message) => {
        document.querySelector('.modal__message').textContent = message;
        document.querySelector('#toggle_fail').checked = true;
    }

    const closeReserveModal = () => {
        document.querySelector('#toggle_reserve').checked = false;
        document.querySelector('.reserve-form').reset() //reset form on close
    }

    const showModalLoading = () => {
        document.querySelector('.modal__loading').style.display = 'block';
    }

    const closeModalLoading = () => {
        document.querySelector('.modal__loading').style.display = 'none';
    }

    //handlers
    const handleClick = (e) => {
        const target = Array.from(e.target.classList);
        if(target.indexOf('slideshow__prev') > -1){
            slideIndex -= 1
            showSlide(slideIndex)
        }
        if(target.indexOf('slideshow__next') > -1){
            slideIndex += 1
            showSlide(slideIndex)
        }
        if(target.indexOf('room__banner__img') > -1){
            document.querySelector('.room__slideshow').style.display = "block";
        }
        if(target.indexOf('slideshow') > -1){
            document.querySelector('.slideshow').style.display = "none";
        }
    }

    const handleChange = (e) => {
        booking[e.target.name] = e.target.value
        if(booking.startDate && booking.endDate){
            const dates = calculateTotal()
            updateTotal(dates)
        }
    }

    const handleSubmit = async (e) => {
        const target = Array.from(e.target.classList);
        if(target.indexOf('reserve-form') > -1){
            e.preventDefault()
            const check90 = dateWithin90()
            check90 || showFailModal('請輸入90天內的日期')
            booking.name.length > 0 || showFailModal('請輸入所有欄位')
            booking.phone.length > 0 || showFailModal('請輸入所有欄位')

            //submit form
            if(booking.name.length > 0 && booking.phone.length > 0 && check90){
                showModalLoading()
                try {
                    const response = await reserveRoom()
                    const [ status, message ] = response
                    if(!status){ //reservation fail
                        throw new Error(message.message)
                    }
                    booking = {  //reservation success
                        name: "",
                        phone: "",
                        startDate: "",
                        endDate: "",
                        dates: [],
                        total: 0
                    }
                    showSuccessModal()
                    closeReserveModal()
                } catch (e){
                    console.log(e.message)
                    showFailModal(e.message)
                }
                closeModalLoading()
            }
        }
        
    }
    
    const handleMouseover = (e) => {
        const target = Array.from(e.target.classList);
        if(target.indexOf('roomlist__item') > -1){
            let roomIndex = 0;
            const room = roomsInfo.filter((room, index) => {
                if(room.id === e.target.dataset.roomId) roomIndex = index;
                return room.id === e.target.dataset.roomId;
            })
            document.querySelector('.home__cover').style.background = `url(${room[0].imageUrl}) center center / 100% 100% no-repeat`
            document.querySelector('.home__roomnum h2').textContent = '0' + (roomIndex + 1);
            document.querySelector('.home__roomnum p').textContent = room[0].name;
        }
    }

    //attach listeners
    document.addEventListener('click', handleClick)
    document.addEventListener('change', handleChange)
    document.addEventListener('submit', handleSubmit)
    document.addEventListener('mouseover', handleMouseover)
    
    console.log(window.location.pathname);

    if(window.location.pathname.indexOf("/rooms.html") > -1){ //rooms page
        appendItemsRoomsPage()
    } else if(window.location.pathname.indexOf("/index.html") > -1){ //landing page
        appendRooms()
    } else { //room page
        appendSingleRoom()
        showSlide(slideIndex)
        runDatePicker()
    }
})(keys)