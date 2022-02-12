let i;

const date = new Date();

const thisYear = date.getFullYear();

const yearsOptions = [];

for (i = 1920; i <= thisYear; i++) {

  yearsOptions.push(i);

}

yearsOptions.reverse();

const monthOptions = [];

for (i = 1; i < 13; i++) {

  monthOptions.push(i);

}

const daysOption = [];

for (i = 1; i < 32; i++) {

  daysOption.push(i);

}

export { yearsOptions, monthOptions, daysOption };
