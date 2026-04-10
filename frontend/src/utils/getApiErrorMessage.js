function getApiErrorMessage(error, fallbackMessage = 'Something went wrong. Please try again.') {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  if (Array.isArray(error?.response?.data?.errors) && error.response.data.errors.length > 0) {
    return error.response.data.errors[0].msg || fallbackMessage
  }

  if (error?.message) {
    return error.message
  }

  return fallbackMessage
}

export default getApiErrorMessage