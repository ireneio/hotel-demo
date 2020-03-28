;(function(){
    let roomsInfo = []
    const fetchInfo = {
        headers: {
            'Authorization': `Bearer ${keys.hexSchool_key}`
        }
    }
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
        document.querySelector('.loading').style.opacity = '0';
        document.querySelector('.loading').style.zIndex = '-999';
        document.querySelector('body').style.overflow = "auto";
        document.querySelector('body').style.overflowX = "hidden";
        document.querySelector('body .container').style.opacity = "1";

        setBackground()
        addMouseoverListener()
    }
    const setBackground = () => {
        document.querySelector('.home__cover').style.background = `url(${roomsInfo[3].imageUrl}) center center / 100% 100% no-repeat`
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

        document.querySelector('.loading').style.opacity = '0';
        document.querySelector('.loading').style.zIndex = '-999';
        document.querySelector('body').style.overflow = "auto";
        document.querySelector('body .container').style.opacity = "1";
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
            slides[i].style.display = "none";
        }
        slides[slideIndex].style.display = "block";
    }

    //calculate total
    const booking = {
        name: "",
        phone: "",
        startDate: "",
        endDate: "",
        total: 0
    }

    const getDatesBetween = (startDate, endDate) => {
        let result = []
        let currentDate = startDate
        while(currentDate <= endDate){
            result.push(new Date(currentDate))
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
            onSelect: function (dateText, inst) {
                booking.startDate = new Date(dateText)
                const dates = calculateTotal()
                updateTotal(dates)
            }
        });
        $(".datepicker2").datepicker({
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

    const showFailModal = () => {
        document.querySelector('#toggle_fail').checked = true;
    }

    const closeReserveModal = () => {
        document.querySelector('#toggle_reserve').checked = false;
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

    const handleSubmit = (e) => {
        const target = Array.from(e.target.classList);
        if(target.indexOf('reserve-form') > -1){
            e.preventDefault()
            const check90 = dateWithin90()
            check90 || alert('請輸入90天內的日期')
            booking.name.length > 0 || alert('請輸入姓名')
            booking.phone.length > 0 || alert('請輸入電話')

            //TODO submit
            if(booking.name.length > 0 && booking.phone.length > 0 && check90){
                showSuccessModal()
                closeReserveModal()
                document.querySelector('.reserve-form').reset()
            } else {
                showFailModal()
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
    
    if(id === ""){ //landing page
        appendRooms()
    } else { //room page
        appendSingleRoom()
        showSlide(slideIndex)
        runDatePicker()
    }
})(keys)